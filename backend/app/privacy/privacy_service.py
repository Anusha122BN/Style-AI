from typing import Dict, Any

class PrivacyService:
    @staticmethod
    def get_privacy_manifest() -> Dict[str, Any]:
        return {
            "title": "Style AI Privacy by Design Guarantee",
            "principles": [
                {
                    "principle": "Volatile RAM Processing Only",
                    "description": "Biometric full-body and facial images are loaded directly into RAM using Python BytesIO streams. They are decoded in-memory and destroyed immediately after landmark extraction."
                },
                {
                    "principle": "Zero Persistent Image Storage",
                    "description": "We NEVER write uploaded or live camera photographs to any disk storage, cloud bucket, or persistent database."
                },
                {
                    "principle": "No Image Content Logging",
                    "description": "Server logs and error trackers are strictly barred from recording raw image bytes, base64 data, or facial captures."
                },
                {
                    "principle": "Right to Erasure (GDPR Compliant)",
                    "description": "Users can delete their account and profile preferences at any moment through a single click. Deletion is instantaneous and permanent."
                },
                {
                    "principle": "Transparent Limitations",
                    "description": "We do not claim medical or laboratory-grade dimensional accuracy. Height calibration is explicitly declared, distinguishing estimated computer vision metrics from physical measurements."
                }
            ],
            "data_retention_table": {
                "User Credentials (Email, Hash)": "Stored securely in local SQLite database until account deletion",
                "User Preferences (Styles, Budget)": "Stored with account until account deletion",
                "Uploaded Photographs / Camera Feeds": "NEVER retained (0 seconds after CV processing completes)",
                "Biometric Landmarks & Coordinates": "Calculated on-the-fly and returned in the HTTP response; not saved on disk",
                "Anonymous Feedback": "Stored only with explicit opt-in checkbox, devoid of user identity"
            }
        }
