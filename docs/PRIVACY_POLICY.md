# Privacy Policy & Biometric Architecture | Style AI

## 1. Introduction & Privacy by Design Mandate

Style AI was architected under the principle of **Privacy by Design**. Unlike conventional cloud applications that persist user photographs to cloud buckets (e.g. AWS S3, Google Cloud Storage), Style AI treats all biometric user photographs as ephemeral data streams.

---

## 2. Core Privacy Guarantees

### 2.1 Volatile Memory (RAM) Processing
- All uploaded photographs and live camera frames are streamed into volatile RAM using Python's `io.BytesIO`.
- No image bytes are ever written to hard drives, swap partitions, temporary directories (`/tmp`), or persistent databases.
- Following computer vision landmark extraction, image buffers are deallocated, and Python's garbage collector (`gc.collect()`) is triggered.

### 2.2 Strict Zero Biometric Retention
- Raw facial imagery, body photographs, and biometric landmark vectors are **never retained** after the HTTP response is dispatched.
- System error logging explicitly censors image payloads to prevent accidental leakage in diagnostic stack traces.

### 2.3 Transparent Distinction of Measurements
- We distinguish between:
  1. Direct User Inputs (Physical height entered by user)
  2. Estimated Computer Vision Metrics (Pixel distances converted via height calibration)
  3. Derived Anthropometric Ratios (Shoulder-to-Hip Ratio, Waist-to-Hip Ratio)
- We explicitly avoid claiming medical or laboratory-grade tailoring accuracy from 2D consumer photographs.

---

## 3. Data Retention Table

| Data Element | Storage Location | Retention Lifetime | Purpose |
| :--- | :--- | :--- | :--- |
| **Uploaded Photographs** | In-Memory (BytesIO) | **0 Seconds** (Deleted upon response) | MediaPipe landmark computation |
| **Live Camera Feeds** | Browser Memory / RAM | **0 Seconds** (Deleted upon response) | Posture alignment & landmark analysis |
| **Biometric Landmarks** | Ephemeral RAM | **0 Seconds** (Sent in HTTP response) | Rendering visual skeleton calipers |
| **User Email & Passwords** | Local SQLite Database | Retained until Account Deletion | Authentication; passwords hashed with Argon2/Bcrypt |
| **Styling Preferences** | Local SQLite Database | Retained until Account Deletion | Storing preferred occasions, budget, and favorite colors |
| **Anonymous Feedback** | CSV File | Indefinite (Opt-in only) | Evaluating model fairness; zero PII attached |

---

## 4. User Rights (GDPR & Data Protection)

1. **Right to Access**: Users can view all saved preference data through the User Profile dashboard.
2. **Right to Rectification**: Users can update their physical height, style preferences, and occasion filters at any time.
3. **Right to Erasure (Right to be Forgotten)**: Users can permanently delete their account with a single click in the Profile settings, instantly wiping all associated database records.
