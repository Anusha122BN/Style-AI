# Module Descriptions | Style AI Explainable AI Fashion Advisor

## 1. Authentication & Security Module (`backend/app/auth/`)
- `security.py`:
  - Password hashing utilizing `passlib` with Argon2 as primary scheme and Bcrypt as resilient fallback.
  - JWT token creation and decoding via `pyjwt` with HS256 encryption.
  - SQLite database management for users, password resets, and preference dictionaries.
  - `get_current_user` FastAPI dependency for protected endpoint security.
- `auth_routes.py`:
  - Exposes `/signup`, `/login`, `/me`, `/profile`, `/forgot-password`, `/reset-password`, and `/account`.

---

## 2. Computer Vision & Biometrics Module (`backend/app/cv/`)
- `pose_analyzer.py`:
  - Implements `MediaPipe Pose` tracking 33 skeletal keypoints.
  - Calculates physical scale factor ($S = \text{height\_cm} / H_{\text{px}}$) via user height calibration.
  - Calculates shoulder width, chest width, waist width, hip width, torso length, and leg length.
  - Formulates Shoulder-to-Hip Ratio ($SHR$), Waist-to-Hip Ratio ($WHR$), and Torso-to-Leg Ratio ($TLR$).
- `skin_analyzer.py`:
  - Implements `MediaPipe FaceMesh` extracting 468 facial landmark coordinates.
  - Samples median RGB patches from Forehead, Left Cheek, and Right Cheek.
  - Implements Gray-World white balance illumination normalization.
  - Converts RGB to standard CIELAB space ($L^*, a^*, b^*$).
  - Calculates perceptual Delta E 2000 ($\Delta E_{00}$) against the 10 Monk Skin Tone reference categories.
  - Determines undertone (Warm, Cool, Neutral, Olive) from chromatic vectors.
- `visualizer.py`:
  - Renders luxury champagne-gold skeletal overlays and horizontal caliper markers on the image.
  - Applies soft privacy Gaussian blur over facial regions before returning base64 images.

---

## 3. Recommendation & XAI Engines (`backend/app/engines/`)
- `body_shape.py`:
  - Mathematical classification of body structures:
    - Women: Hourglass, Pear, Apple, Rectangle, Inverted Triangle.
    - Men: Trapezoid, Rectangle, Triangle, Inverted Triangle, Oval.
  - Calculates confidence levels and proximity scores to alternative silhouettes.
- `dress_advisor.py`:
  - Cross-references classified shape and user preferences against the `dress_knowledge_base.json`.
  - Generates recommended outfits and identifies "Styles to Consider Carefully" with non-judgmental structural advice.
- `makeup_advisor.py`:
  - Maps skin depth and undertone to foundation shades, lipsticks (Nude, Brown, Pink, Red, Maroon, Berry, Peach, Mauve), eyeliners, eyeshadows, blushes, highlighters, and occasion blueprints.
- `color_advisor.py`:
  - Generates personalized hex-coded swatches for wardrobe, traditional/festive, formal, and metallic accessories.
- `xai_explainer.py`:
  - Rule-based traceable reasoning linking clothing cuts to user ratios.
  - Trains a surrogate Decision Tree model on anthropometric distributions.
  - Computes exact SHAP feature importance via `shap.TreeExplainer`.
  - Calculates mathematical counterfactual shifts to adjacent classification boundaries.
- `shopping.py`:
  - Constructs live search query URLs for Myntra, AJIO, Meesho, Flipkart, and Amazon.

---

## 4. Privacy & Feedback Modules (`backend/app/privacy/` & `feedback/`)
- `image_processor.py`:
  - Streams multipart uploads into `io.BytesIO`.
  - Assesses blur via Laplacian variance and illumination via grayscale luminance.
  - Deallocates memory buffers and triggers garbage collection.
- `feedback_service.py`:
  - Logs user ratings and accuracy evaluations to an anonymous CSV file with explicit consent.
