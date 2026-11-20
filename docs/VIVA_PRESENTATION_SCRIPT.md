# Viva Presentation Script & Demo Guide | Style AI

Use this comprehensive viva script and demonstration flow when presenting the project to examiners, professors, or clients.

---

## Slide 1: Introduction & Problem Statement
> **Speaker**:  
> "Good morning, respected examiners. Today I am proud to present **Style AI: Explainable AI Fashion & Makeup Advisor – Your Personal AI Stylist**.  
> The existing fashion recommendation systems in e-commerce suffer from two critical flaws:  
> 1. They operate as **opaque black-boxes**, simply telling users *'wear this'* without any scientific rationale or traceable geometric explanation.  
> 2. Most AI beauty apps are either female-only, intrusive with biometric user images, or fail across diverse, deeper skin tones due to biased Fitzpatrick scales.  
>  
> Style AI solves this by providing a **full-stack, dual-gender (Men & Women) personal stylist** combining **MediaPipe anthropometric calibration, the inclusive 10-category Monk Skin Tone scale, authentic SHAP feature explanations, counterfactual boundaries, and a strict Privacy-by-Design zero-disk architecture**."

---

## Slide 2: Architectural Innovations
> **Speaker**:  
> "Our architecture is divided into five core layers:  
> - **Frontend**: React 19, Tailwind CSS v4, and Vite with luxury glassmorphism aesthetics.  
> - **Computer Vision**: MediaPipe Pose and FaceMesh for 33 full-body and 468 facial keypoints.  
> - **Color Science**: Gray-World White Balance illumination correction and CIEDE2000 ($\Delta E_{00}$) color difference across the Google Monk Scale.  
> - **Explainable AI (XAI)**: A scikit-learn surrogate decision tree coupled with `shap.TreeExplainer` and mathematical counterfactual calculations.  
> - **Privacy**: Volatile in-memory processing using Python `io.BytesIO`. No biometric photographs are ever stored on disk or server databases."

---

## Live Demonstration Flow (Step-by-Step)

### Step 1: Landing Page & Authentication
1. Show the landing page. Point out the luxury branding, value pillars, and trust badges.
2. Click **"Log In"** or use the **"Quick Demo Access"** button to log in instantly.
3. Show that authentication uses **Argon2 / BCrypt password hashing** and **JWT Bearer tokens** stored securely.

### Step 2: Body Shape Analysis
1. Navigate to **"Body Analysis"**.
2. Explain the height calibration: *"We ask the user for their true height (e.g. 170 cm) to convert pixel coordinates into physical centimeters. We never pretend an uncalibrated 2D photo can measure absolute metric dimensions without a physical reference."*
3. Demonstrate both **Live Camera** (with posture guide overlay and 3-second countdown) and **Photo Upload**.
4. Click **"Run Geometric Shape Analysis"**.
5. Show the results:
   - Detected body shape (e.g., Hourglass, Pear, Trapezoid, etc.).
   - Annotated landmark image with horizontal calipers (and facial privacy blur).
   - The dimensional table clearly distinguishing: **Direct User Inputs**, **Estimated CV Metrics**, and **Derived Anthropometric Ratios (SHR, WHR, TLR)**.
   - Proportions bar chart.

### Step 3: Skin Tone & Undertone Analysis
1. Navigate to **"Skin & Undertone"**.
2. Run analysis on a facial snapshot.
3. Point out the **10 Monk Skin Tone reference spectrum**. Show the matched category (e.g. MST-04 Wheat).
4. Point out the **Gray-World white balance illumination correction** and the **Forehead, Left Cheek, and Right Cheek multi-region sampling** with the consistency score.
5. Highlight the calculated **undertone** (Warm, Cool, Neutral, Olive) and Delta E distance.

### Step 4: Fashion Recommendations & Explainable AI (The Project Highlight!)
1. Navigate to **"Fashion Advisor"**.
2. Switch between **Women's Wardrobe** and **Men's Wardrobe**.
3. Point out the detailed specifications on each outfit card: recommended fit, neckline, sleeve, fabric, suitable colors, occasion, and budget.
4. Click **"Explain My Recommendation"** on any dress card:
   - **Rule-Based Explanation**: *"This A-line dress is prioritized because its fitted bodice that gently flares from natural waist directly harmonizes with your Pear profile..."*
   - **SHAP Feature Importance**: Show the interactive horizontal bar chart. Explain: *"Gold bars show features pushing towards this recommendation; burgundy bars indicate opposing features."*
   - **Counterfactual Boundary**: Read out: *"If your shoulder-to-hip ratio changed from 0.82 to 0.95, your classification would shift to Rectangle."*
   - Toggle **Simple Mode** vs **Technical Mode** (showing exact numerical thresholds and decision tree parameters).
5. Scroll down to **"Styles to Consider Carefully"**: Explain that Style AI advises users on cuts that alter balance without any body-shaming language.

### Step 5: Complete Makeup Advisor & Color Palette
1. Navigate to **"Makeup Advisor"**: show foundation match, lipsticks (Nude, Brown, Pink, Red, Maroon, Berry, Peach, Mauve), eyeliners, eyeshadow palettes, and occasion lookbooks (Daily, Office, Wedding, Glam).
2. Navigate to **"Color Palette"**: show copyable HEX swatches for wardrobe, traditional, formal, and metallic jewelry tones.

### Step 6: Multi-Store Shopping Integration
1. On any dress or makeup card, or in the **"Shopping Hub"**, click a retail link (e.g. **Myntra**, **AJIO**, **Amazon**).
2. Show that it opens the genuine store search with properly encoded attributes and colors. Explain: *"We do not invent fake prices or fake stock; we redirect users to verified search listings."*

### Step 7: Privacy & Feedback
1. Navigate to **"Privacy by Design"**: show the volatile RAM guarantee and the data retention audit table.
2. Navigate to **"Feedback"**: show the model fairness evaluation and anonymous CSV logging.

---

## Typical Viva Questions & Answers

**Q1: How do you handle racial and skin tone bias in your AI?**  
*Answer*: *"Traditional systems use the Fitzpatrick scale, which was developed in 1975 for dermatological sun reactivity and clusters deeper skin tones into only two coarse categories (Type V and VI). Style AI adopts the Google Monk Skin Tone scale, which provides 10 inclusive, perceptually equidistant reference shades, evaluated with the international standard CIEDE2000 algorithm and Gray-World illumination correction."*

**Q2: What is the difference between your SHAP explanation and a rule-based explanation?**  
*Answer*: *"A rule-based explanation uses hard-coded anthropometric logic (e.g. if SHR < 0.90, recommend A-line). In contrast, our SHAP engine trains a surrogate Decision Tree model on simulated population distributions and computes exact Shapley Additive exPlanations using cooperative game theory, quantifying the precise numerical log-odds contribution of every ratio."*

**Q3: How do you ensure user privacy when handling camera feeds and photographs?**  
*Answer*: *"We implement Privacy-by-Design. All uploaded images are processed in volatile RAM using Python's `io.BytesIO`. They are decoded in-memory and immediately freed with garbage collection. No photographs are ever saved to disk or persistent storage, and users can delete their entire account with a single click."*
