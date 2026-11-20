import json
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.auth_routes import router as auth_router
from app.privacy.image_processor import PrivacyImageProcessor
from app.privacy.privacy_service import PrivacyService
from app.cv.pose_analyzer import PoseAnalyzer
from app.cv.skin_analyzer import SkinAnalyzer
from app.cv.visualizer import LandmarkVisualizer
from app.engines.body_shape import BodyShapeClassifier
from app.engines.dress_advisor import DressAdvisor
from app.engines.makeup_advisor import MakeupAdvisor
from app.engines.color_advisor import ColorAdvisorjj
from app.engines.xai_explainer import XAIExplainerEngine
from app.engines.shopping import ShoppingEngine
from app.engines.chat_engine import ChatEngine
from app.feedback.feedback_service import FeedbackService
from app.schemas import (
    BodyAnalysisResponse,
    SkinAnalysisResponse,
    RecommendationResponse,
    SinglePhotoAnalysisResponse,
    FeedbackCreate,
    DressExplanationDetail,
    ShoppingLinks,
    ChatMessageRequest,
    ChatMessageResponse
)

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI(
    title="Style AI | Explainable AI Fashion & Makeup Advisor",
    description="Full-stack AI personal stylist analyzing body shape, skin tone, and proportions with authentic XAI and direct shopping links.",
    version="2.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global JSON Exception Handlers to guarantee valid JSON responses on all errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = err.get("msg", "Invalid value")
        errors.append(f"{field}: {msg}" if field else msg)
    return JSONResponse(
        status_code=422,
        content={"detail": "; ".join(errors) if errors else "Validation error occurred."}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail}
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."}
    )

# Mount Auth router
app.include_router(auth_router)

# Lazy singleton engines
pose_analyzer = PoseAnalyzer()
skin_analyzer = SkinAnalyzer()
dress_advisor = DressAdvisor()
makeup_advisor = MakeupAdvisor()
xai_explainer = XAIExplainerEngine()
chat_engine = ChatEngine()

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Explainable AI Fashion & Makeup Advisor (Style AI)",
        "models_ready": True,
        "privacy_mode": "Volatile RAM Only (BytesIO)",
        "supported_genders": ["Women", "Men", "Unspecified"]
    }

# ----------------- CV & Biometrics Analysis (In-Memory Only) -----------------

@app.post("/api/cv/analyze-body", response_model=BodyAnalysisResponse)
async def analyze_body(
    image: UploadFile = File(...),
    gender: str = Form("women"),
    height_cm: float = Form(168.0)
):
    """
    Analyzes body proportions using MediaPipe Pose.
    Enforces zero disk storage: decoded strictly in RAM and cleared after inference.
    """
    image_bgr, quality_report = await PrivacyImageProcessor.load_and_validate_image(image)
    try:
        measurements, metadata, landmarks = pose_analyzer.analyze_pose(
            image_bgr=image_bgr,
            user_height_cm=height_cm,
            gender=gender
        )
        classification = BodyShapeClassifier.classify(measurements, gender=gender)

        # Generate landmark skeleton visualization
        measurements_dict = measurements.model_dump() if hasattr(measurements, 'model_dump') else measurements.dict()
        annotated_image = LandmarkVisualizer.draw_body_analysis_overlay(
            image_bgr=image_bgr,
            landmarks=landmarks,
            measurements=measurements_dict,
            anonymize_face=True
        )

        return BodyAnalysisResponse(
            status="success",
            gender=gender,
            measurements=measurements,
            classification=classification,
            annotated_landmark_image=annotated_image,
            privacy_notice="Image analyzed exclusively in volatile memory; immediately cleared after landmark extraction."
        )
    finally:
        # Guarantee RAM deallocation
        PrivacyImageProcessor.secure_cleanup(image_bgr)

@app.post("/api/cv/analyze-skin", response_model=SkinAnalysisResponse)
async def analyze_skin(image: UploadFile = File(...)):
    """
    Analyzes skin tone using MediaPipe Face Mesh, CIELAB, Delta E 2000, and Monk Scale.
    Enforces Gray-World White Balance illumination correction.
    """
    image_bgr, quality_report = await PrivacyImageProcessor.load_and_validate_image(image)
    try:
        response = skin_analyzer.analyze_skin(image_bgr)
        return response
    finally:
        PrivacyImageProcessor.secure_cleanup(image_bgr)

@app.post("/api/cv/analyze-single-photo", response_model=SinglePhotoAnalysisResponse)
@app.post("/api/cv/analyze-complete", response_model=SinglePhotoAnalysisResponse)
async def analyze_single_photo(
    image: UploadFile = File(...),
    gender: str = Form("women"),
    height_cm: float = Form(168.0),
    category: Optional[str] = Form(None),
    budget_tier: Optional[str] = Form(None),
    occasion: Optional[str] = Form(None),
    favorite_colors: Optional[str] = Form(None),
    wants_makeup: Optional[bool] = Form(False)
):
    """
    Unified Single-Photo Analysis Engine:
    Processes ONE clear front-facing photograph in RAM.
    1. Calibrates physical dimensions using user height.
    2. Identifies skeletal keypoints (MediaPipe Pose) and estimates body shape.
    3. Detects if complete body is visible; guides user if severely cropped.
    4. Evaluates facial region (MediaPipe Face Mesh) on the SAME image for skin tone & undertone.
       If face is not visible or obscured, proceeds transparently with body analysis and explains why skin was omitted.
    5. Curates strictly filtered fashion recommendations matching the selected category.
    6. Generates tailored makeup blueprints if requested and face is detected.
    7. Cleanses volatile memory immediately. Zero disk storage.
    """
    image_bgr, quality_report = await PrivacyImageProcessor.load_and_validate_image(image)
    try:
        # Step 1: MediaPipe Pose Analysis
        measurements, metadata, landmarks = pose_analyzer.analyze_pose(
            image_bgr=image_bgr,
            user_height_cm=height_cm,
            gender=gender
        )

        # Step 2: Body Shape Classification
        classification = BodyShapeClassifier.classify(measurements, gender=gender)

        # Step 3: Landmark visualizer overlay
        measurements_dict = measurements.model_dump() if hasattr(measurements, 'model_dump') else measurements.dict()
        annotated_image = LandmarkVisualizer.draw_body_analysis_overlay(
            image_bgr=image_bgr,
            landmarks=landmarks,
            measurements=measurements_dict,
            anonymize_face=True
        )

        # Step 4: Facial skin tone & undertone from the SAME image
        face_detected, skin_resp, skin_note = skin_analyzer.analyze_face_from_full_body(
            image_bgr=image_bgr,
            pose_landmarks=landmarks
        )

        # Step 5: Harmonious Color Palette
        if skin_resp:
            palette = ColorAdvisor.generate_palette(
                monk_tone_id=skin_resp.monk_tone_id,
                undertone=skin_resp.estimated_undertone
            )
        else:
            palette = ColorAdvisor.generate_palette(
                monk_tone_id="MST-04",
                undertone="Warm"
            )

        # Step 6: Initial Fashion Recommendations (Strict to Selected Category)
        recommended_dresses = None
        careful_dresses = None
        if category and category.lower() != "all":
            occ_list = [occasion.strip()] if occasion and occasion.lower() != "all" else None
            col_list = [c.strip() for c in favorite_colors.split(",")] if favorite_colors else None
            recommended_dresses, careful_dresses = dress_advisor.recommend(
                gender=gender,
                body_shape=classification.detected_shape,
                selected_category=category,
                selected_occasions=occ_list,
                budget_tier=budget_tier,
                favorite_colors=col_list
            )

        # Step 7: Optional Makeup Recommendations (from the same photo)
        makeup_items = None
        occasion_looks = None
        if wants_makeup and skin_resp:
            makeup_data = makeup_advisor.recommend(
                monk_tone_id=skin_resp.monk_tone_id,
                undertone=skin_resp.estimated_undertone,
                makeup_style=occasion or "Office makeup"
            )
            makeup_items = makeup_data.get("product_recommendations")
            occasion_looks = makeup_data.get("occasion_looks")

        return SinglePhotoAnalysisResponse(
            status="success",
            gender=gender,
            measurements=measurements,
            classification=classification,
            annotated_landmark_image=annotated_image,
            face_detected=face_detected,
            skin_analysis=skin_resp,
            skin_note=skin_note,
            color_palette=palette,
            selected_category=category,
            recommended_dresses=recommended_dresses,
            styles_to_consider_carefully=careful_dresses,
            makeup_recommendations=makeup_items,
            occasion_looks=occasion_looks,
            privacy_notice="Image analyzed exclusively in volatile memory; immediately cleared after landmark extraction."
        )
    finally:
        PrivacyImageProcessor.secure_cleanup(image_bgr)

# ----------------- Fashion & Makeup Recommendations -----------------

@app.get("/api/recommendations/fashion")
async def get_fashion_recommendations(
    gender: str = Query("women"),
    body_shape: str = Query("Hourglass"),
    category: Optional[str] = Query(None), # STRICT filtering category
    occasions: Optional[str] = Query(None), # Comma separated
    budget_tier: Optional[str] = Query(None),
    favorite_colors: Optional[str] = Query(None) # Comma separated
):
    occ_list = [o.strip() for o in occasions.split(",")] if occasions else None
    col_list = [c.strip() for c in favorite_colors.split(",")] if favorite_colors else None

    recommended, careful = dress_advisor.recommend(
        gender=gender,
        body_shape=body_shape,
        selected_category=category,
        selected_occasions=occ_list,
        budget_tier=budget_tier,
        favorite_colors=col_list
    )
    return {
        "gender": gender,
        "body_shape": body_shape,
        "category": category,
        "recommended_dresses": recommended,
        "styles_to_consider_carefully": careful
    }

@app.get("/api/recommendations/makeup")
async def get_makeup_recommendations(
    monk_tone_id: str = Query("MST-04"),
    undertone: str = Query("Warm"),
    makeup_style: Optional[str] = Query("Office makeup")
):
    return makeup_advisor.recommend(
        monk_tone_id=monk_tone_id,
        undertone=undertone,
        makeup_style=makeup_style
    )

@app.get("/api/recommendations/palette")
async def get_color_palette(
    monk_tone_id: str = Query("MST-04"),
    undertone: str = Query("Warm")
):
    return ColorAdvisor.generate_palette(
        monk_tone_id=monk_tone_id,
        undertone=undertone
    )

# ----------------- Explainable AI (XAI) -----------------

@app.get("/api/xai/explain-dress", response_model=DressExplanationDetail)
async def explain_dress(
    dress_id: str = Query(...),
    gender: str = Query("women"),
    body_shape: str = Query("Hourglass"),
    shoulder_to_hip_ratio: float = Query(1.0),
    waist_to_hip_ratio: float = Query(0.74),
    torso_to_leg_ratio: float = Query(0.65),
    shoulder_width_cm: float = Query(38.0),
    hip_width_cm: float = Query(38.0),
    waist_width_cm: float = Query(28.0)
):
    """
    Generates rule-based, surrogate decision-tree SHAP, and counterfactual explanations
    for why a particular garment suits or balances the user's silhouette.
    """
    dress_item = next((d for d in dress_advisor.dress_kb if d["id"] == dress_id), None)
    if not dress_item:
        raise HTTPException(status_code=404, detail="Garment not found.")

    measurements = {
        "shoulder_to_hip_ratio": shoulder_to_hip_ratio,
        "waist_to_hip_ratio": waist_to_hip_ratio,
        "torso_to_leg_ratio": torso_to_leg_ratio,
        "shoulder_width_cm": shoulder_width_cm,
        "hip_width_cm": hip_width_cm,
        "waist_width_cm": waist_width_cm
    }

    explanation = xai_explainer.generate_recommendation_explanation(
        dress_item=dress_item,
        measurements=measurements,
        body_shape=body_shape,
        gender=gender
    )
    return explanation

@app.get("/api/xai/counterfactuals")
async def get_counterfactuals(
    gender: str = Query("women"),
    body_shape: str = Query("Hourglass"),
    shoulder_to_hip_ratio: float = Query(1.0),
    waist_to_hip_ratio: float = Query(0.74)
):
    measurements = {
        "shoulder_to_hip_ratio": shoulder_to_hip_ratio,
        "waist_to_hip_ratio": waist_to_hip_ratio
    }
    return xai_explainer.compute_counterfactuals(
        measurements=measurements,
        gender=gender,
        current_shape=body_shape
    )

# ----------------- Shopping Integration -----------------

@app.get("/api/shopping/links", response_model=ShoppingLinks)
async def get_shopping_links(
    query: str = Query(...),
    category: Optional[str] = Query(""),
    color: Optional[str] = Query("")
):
    return ShoppingEngine.generate_links(query=query, category=category, color=color)

# ----------------- Feedback & Privacy Policy -----------------

@app.post("/api/feedback")
async def submit_feedback(payload: FeedbackCreate):
    FeedbackService.record_feedback(payload)
    return {"status": "success", "message": "Thank you for sharing your thoughtful feedback."}

@app.get("/api/privacy/policy")
async def get_privacy_policy():
    return PrivacyService.get_privacy_manifest()

# ----------------- Multilingual AI Stylist Chatbot -----------------

@app.post("/api/chat", response_model=ChatMessageResponse)
async def chat_with_stylist(payload: ChatMessageRequest):
    return chat_engine.generate_response(
        message=payload.message,
        language=payload.language or "en",
        gender=payload.gender or "women",
        body_shape=payload.body_shape,
        skin_tone=payload.skin_tone,
        undertone=payload.undertone,
        conversation_history=payload.conversation_history
    )
