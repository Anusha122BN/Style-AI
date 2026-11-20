# Style AI | Explainable AI Fashion & Makeup Advisor – Your Personal AI Stylist

[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%20%26%20FaceMesh-0072B2?logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![SHAP](https://img.shields.io/badge/XAI-SHAP%20%26%20Surrogate%20Trees-FF6F00)](https://shap.readthedocs.io)
[![Privacy](https://img.shields.io/badge/Privacy-RAM--Only%20(BytesIO)-2E7D32?logo=shield&logoColor=white)](#privacy-by-design)
[![Tests](https://img.shields.io/badge/Tests-11%20Passed%20(100%25)-success)](backend/tests/)

> A complete, professional, full-stack AI-powered personal stylist designed for **BOTH MEN AND WOMEN**. Analyzes anatomical body structure, physical proportions, and skin undertones using live camera capture or uploaded photographs, accompanied by authentic Explainable AI (SHAP), counterfactual boundary explanations, and multi-store direct shopping integration.

---

## Key Highlights

- **Dual Gender Support**: Comprehensive styling architectures for both Men (Trapezoid, Rectangle, Triangle, Inverted Triangle, Oval) and Women (Hourglass, Pear, Apple, Rectangle, Inverted Triangle).
- **Physical Height Calibration**: Converts pixel coordinates to physical centimeters using user height input. Distinguishes directly measured inputs from estimated computer vision widths and derived ratios.
- **Inclusive Color Science**: Adopts the 10-category Google Monk Skin Tone (MST) scale with CIEDE2000 ($\Delta E_{00}$) color difference and Gray-World white balance illumination correction.
- **Explainable AI (Main Feature)**: Every clothing and makeup recommendation features an **"Explain My Recommendation"** trigger delivering:
  - Traceable rule-based explanations.
  - Interactive SHAP feature importance bar charts via surrogate decision-tree models.
  - Mathematical counterfactual shifts to adjacent classification boundaries.
  - Dual **Simple** and **Technical** view modes.
- **Complete Makeup Advisor**: Optional module for any user featuring foundation matching, lipsticks (8 shade families), eyeliners, eyeshadow palettes, blushes, highlighters, and occasion blueprints (Daily, College, Office, Party, Wedding, Traditional, Minimal, Glam).
- **Direct Retail Integration**: Encodes direct search query URLs for **Myntra, AJIO, Meesho, Flipkart, and Amazon India**.
- **Privacy by Design**: Biometric images are loaded into volatile memory (`io.BytesIO`), analyzed, and immediately freed. **Zero images are stored on persistent disk or database**.

---

## Project Structure

```
fashion-advisor/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & API routes
│   │   ├── config.py                   # App configuration & settings
│   │   ├── schemas.py                  # Pydantic data schemas
│   │   ├── auth/                       # Security & Authentication
│   │   │   ├── auth_routes.py          # Signup, Login, Password Reset, Profile APIs
│   │   │   └── security.py             # Argon2/Bcrypt hashing, JWT generation, SQLite
│   │   ├── cv/                         # Computer Vision & Color Science
│   │   │   ├── pose_analyzer.py        # MediaPipe Pose & Height calibration
│   │   │   ├── skin_analyzer.py        # MediaPipe FaceMesh, CIELAB, Delta E 2000, Monk scale
│   │   │   └── visualizer.py           # Landmark overlay & privacy face blur
│   │   ├── engines/                    # AI Engines
│   │   │   ├── body_shape.py           # Mathematical body shape classifier
│   │   │   ├── dress_advisor.py        # Fashion recommendation engine
│   │   │   ├── makeup_advisor.py       # Makeup advisor engine
│   │   │   ├── color_advisor.py        # Personal color palette generator
│   │   │   ├── shopping.py             # Multi-store search query URL encoder
│   │   │   └── xai_explainer.py        # Surrogate Decision Tree + SHAP + Counterfactuals
│   │   ├── privacy/                    # Privacy Safeguards
│   │   │   ├── image_processor.py      # In-memory BytesIO handling & quality checks
│   │   │   └── privacy_service.py      # Privacy manifest & retention audit
│   │   ├── data/                       # Knowledge Bases
│   │   │   ├── dress_knowledge_base.json
│   │   │   ├── makeup_knowledge_base.json
│   │   │   └── monk_scale.json
│   │   └── feedback/                   # Feedback
│   │       └── feedback_service.py     # Anonymous feedback CSV service
│   ├── tests/                          # Pytest Suite (11 passing tests)
│   │   ├── test_auth.py
│   │   ├── test_body_classification.py
│   │   ├── test_fairness.py
│   │   ├── test_privacy.py
│   │   └── test_xai.py
│   ├── requirements.txt
│   └── run_backend.py                  # Backend launcher script
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Footer, ExplainModal, CameraModal
│   │   ├── context/                    # AuthContext & Session management
│   │   ├── pages/                      # 12 Feature Pages (Dashboard, Body, Skin, Fashion, etc.)
│   │   ├── services/api.js             # API client connecting to backend
│   │   ├── App.jsx                     # Main application layout & router
│   │   ├── main.jsx                    # React entrypoint
│   │   └── index.css                   # Tailwind CSS v4 styling & luxury variables
│   ├── package.json
│   └── vite.config.js
│
├── docs/                               # Comprehensive Documentation
│   ├── SYSTEM_ARCHITECTURE.md          # Architectural diagrams & layer specs
│   ├── DATA_FLOW.md                    # Sequence diagrams & data transformations
│   ├── PRIVACY_POLICY.md               # Ephemeral RAM guarantee & GDPR rights
│   ├── MODULE_DESCRIPTIONS.md          # Code-level subsystem documentation
│   ├── LIMITATIONS_AND_FUTURE_SCOPE.md # Scientific disclosures & roadmap
│   └── VIVA_PRESENTATION_SCRIPT.md     # Examiner presentation script & Q&A
│
└── README.md
```

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# From workspace root
python -m pip install -r backend/requirements.txt

# Run test suite to verify everything
python -m pytest backend/tests

# Start FastAPI backend (port 8000)
python backend/run_backend.py
```
Backend will be live at `http://127.0.0.1:8000`. API documentation available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies (already prepared)
npm install

# Start Vite development server (port 5173)
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Demo Credentials
For rapid evaluation without registration:
- **Women's Persona**: Email: `elena.vance@styleai.com` | Password: `LuxuryFashion2026!`
- **Men's Persona**: Email: `julian.ross@styleai.com` | Password: `LuxuryFashion2026!`
- Or click **"Quick Demo Access"** on the landing page!

---

## Testing & Quality Assurance
Run all 11 unit, integration, fairness, and privacy tests:
```bash
python -m pytest backend/tests
```
Test results verify:
1. `test_auth.py`: Password hashing with Argon2/Bcrypt, JWT decoding, and protected routes.
2. `test_body_classification.py`: Mathematical classification across all 5 female and 5 male silhouettes.
3. `test_fairness.py`: Fairness evaluation across all 10 Monk Skin Tone reference categories and Gray-World white balance.
4. `test_privacy.py`: Image quality checks, RAM deallocation, and privacy manifest audit.
5. `test_xai.py`: Surrogate Decision Tree SHAP feature importance and counterfactual boundary calculations.

---

## Documentation Links
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Data Flow Specification](docs/DATA_FLOW.md)
- [Privacy Policy & Biometric Architecture](docs/PRIVACY_POLICY.md)
- [Module Descriptions](docs/MODULE_DESCRIPTIONS.md)
- [Limitations & Future Scope](docs/LIMITATIONS_AND_FUTURE_SCOPE.md)
- [Viva Presentation Script & Examiner Q&A](docs/VIVA_PRESENTATION_SCRIPT.md)
