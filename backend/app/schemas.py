from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class UserSignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    gender_preference: Optional[str] = "Women" # Men, Women, Prefer not to specify
    height_cm: Optional[float] = 168.0

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str = Field(..., min_length=6)

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    gender_preference: Optional[str] = None
    height_cm: Optional[float] = None
    preferred_styles: Optional[List[str]] = None
    occasions: Optional[List[str]] = None
    budget_tier: Optional[str] = None
    favorite_colors: Optional[List[str]] = None
    wants_makeup: Optional[bool] = None
    preferred_platforms: Optional[List[str]] = None

# Computer Vision & Body Analysis
class BodyAnalysisInput(BaseModel):
    gender: str = "women" # "women", "men", "unspecified"
    height_cm: float = 168.0

class LandmarkPoint(BaseModel):
    name: str
    x: float
    y: float
    z: float
    visibility: float

class BodyMeasurements(BaseModel):
    height_cm: float
    shoulder_width_cm: float
    chest_width_cm: float
    waist_width_cm: float
    hip_width_cm: float
    torso_length_cm: float
    leg_length_cm: float
    shoulder_to_hip_ratio: float
    waist_to_hip_ratio: float
    torso_to_leg_ratio: float
    measurement_type: str = "Estimated Computer Vision + Height Calibration"

class BodyShapeClassification(BaseModel):
    detected_shape: str
    confidence: float
    mathematical_basis: str
    classification_thresholds: Dict[str, Any]
    ratio_summary: Dict[str, float]
    alternative_shape_proximities: Dict[str, float]
    measurement_limitations: str

class BodyAnalysisResponse(BaseModel):
    status: str
    gender: str
    measurements: BodyMeasurements
    classification: BodyShapeClassification
    annotated_landmark_image: Optional[str] = None # Base64 data URL
    privacy_notice: str = "Image processed entirely in volatile RAM and immediately freed. No biometric images are retained."

# Skin Tone & Undertone
class ColorComponent(BaseModel):
    r: int
    g: int
    b: int
    hex_code: str
    lab_l: float
    lab_a: float
    lab_b: float

class SkinAnalysisResponse(BaseModel):
    status: str
    monk_tone_id: str
    monk_tone_name: str
    monk_tone_description: str
    monk_hex: str
    user_skin_color: ColorComponent
    forehead_color: ColorComponent
    left_cheek_color: ColorComponent
    right_cheek_color: ColorComponent
    color_consistency_score: float
    estimated_undertone: str # "Warm", "Cool", "Neutral", "Olive"
    delta_e_distance: float
    lighting_quality: str # "Optimal", "Acceptable", "Underexposed", "Overexposed"
    lighting_recommendation: str
    confidence: float
    limitations: str
    recommended_palette: List[str]

# Explainable AI (XAI)
class ShapFeatureImportance(BaseModel):
    feature_name: str
    importance_score: float
    user_feature_value: float
    direction: str # "supports", "opposes"
    impact_description: str

class CounterfactualExplanation(BaseModel):
    target_shape: str
    required_ratio_changes: Dict[str, Dict[str, float]] # e.g. {"shoulder_to_hip_ratio": {"current": 0.85, "required": 1.05, "delta": +0.20}}
    explanation: str

class DressExplanationDetail(BaseModel):
    dress_id: str
    dress_name: str
    recommended_shape: str
    rule_explanation: str
    proportions_complemented: str
    shap_features: List[ShapFeatureImportance]
    counterfactuals: List[CounterfactualExplanation]
    why_unsuitable_styles_diverge: str
    technical_details: Dict[str, Any]

# Recommendations
class ShoppingLinks(BaseModel):
    myntra: str
    ajio: str
    meesho: str
    flipkart: str
    amazon: str

class DressRecommendationItem(BaseModel):
    id: str
    name: str
    gender: str
    category: str
    clothing_type: Optional[str] = None
    fit: str
    neckline: str
    sleeve: str
    fabric: str
    proportions_complemented: str
    suitable_colors: List[str]
    occasions: List[str]
    budget_category: str
    price_range_inr: Optional[str] = None
    image_url: str
    shopping_links: ShoppingLinks
    why_suits_body: str
    suitability_score: float
    is_carefully_considered: bool = False
    consideration_reason: Optional[str] = None

class MakeupRecommendationItem(BaseModel):
    product_category: str # "Foundation", "Lipstick", "Eyeliner", "Eyeshadow", "Blush", "Highlighter"
    shade_name: str
    hex_color: Optional[str] = None
    undertone_match: str
    explanation: str
    alternative_shades: List[Dict[str, str]]
    recommended_finish: Optional[str] = None
    shopping_links: ShoppingLinks

class OccasionMakeupLook(BaseModel):
    occasion: str
    focus: str
    base: str
    eyes: str
    cheeks: str
    lips: str
    shopping_links: ShoppingLinks

class RecommendationResponse(BaseModel):
    gender: str
    body_shape: str
    skin_tone: Optional[str] = None
    undertone: Optional[str] = None
    recommended_dresses: List[DressRecommendationItem]
    styles_to_consider_carefully: List[DressRecommendationItem]
    makeup_recommendations: Optional[List[MakeupRecommendationItem]] = None
    occasion_looks: Optional[List[OccasionMakeupLook]] = None
    color_palette: Dict[str, List[Dict[str, str]]]

class SinglePhotoAnalysisResponse(BaseModel):
    status: str
    gender: str
    measurements: BodyMeasurements
    classification: BodyShapeClassification
    annotated_landmark_image: Optional[str] = None
    
    # Face & Skin Tone Analysis from the same photo
    face_detected: bool
    skin_analysis: Optional[SkinAnalysisResponse] = None
    skin_note: Optional[str] = None
    
    # Harmonious Color Palette
    color_palette: Optional[Dict[str, List[Dict[str, str]]]] = None
    
    # Curated recommendations based on initial preferences (strict to selected category)
    selected_category: Optional[str] = None
    recommended_dresses: Optional[List[DressRecommendationItem]] = None
    styles_to_consider_carefully: Optional[List[DressRecommendationItem]] = None
    makeup_recommendations: Optional[List[MakeupRecommendationItem]] = None
    occasion_looks: Optional[List[OccasionMakeupLook]] = None
    
    privacy_notice: str = "Image processed entirely in volatile RAM (BytesIO) and immediately cleared. Zero biometric retention."

# Feedback & Privacy
class FeedbackCreate(BaseModel):
    user_email: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    category: str
    comments: str
    recommendation_helpful: bool = True
    body_shape_accurate: bool = True
    skin_tone_accurate: bool = True
    consent_for_anonymous_storage: bool = True

class PrivacySettingsUpdate(BaseModel):
    allow_preferences_saved: bool = True
    allow_anonymous_analytics: bool = False

# Multilingual AI Stylist Chat schemas
class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language: Optional[str] = "en"
    gender: Optional[str] = "women"
    body_shape: Optional[str] = None
    skin_tone: Optional[str] = None
    undertone: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []

class ChatActionItem(BaseModel):
    label: str
    tab: str

class ChatMessageResponse(BaseModel):
    reply: str
    language: str
    detected_intent: Optional[str] = None
    suggested_actions: Optional[List[ChatActionItem]] = []
    quick_replies: Optional[List[str]] = []
