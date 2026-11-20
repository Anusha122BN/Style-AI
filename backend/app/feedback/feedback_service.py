import csv
import os
from datetime import datetime
from app.config import FEEDBACK_CSV_FILE
from app.schemas import FeedbackCreate

class FeedbackService:
    @staticmethod
    def record_feedback(payload: FeedbackCreate) -> bool:
        if not payload.consent_for_anonymous_storage:
            # User opted out of saving feedback
            return True

        FEEDBACK_CSV_FILE.parent.mkdir(parents=True, exist_ok=True)
        file_exists = os.path.exists(FEEDBACK_CSV_FILE)

        with open(FEEDBACK_CSV_FILE, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow([
                    "timestamp",
                    "rating",
                    "category",
                    "recommendation_helpful",
                    "body_shape_accurate",
                    "skin_tone_accurate",
                    "comments"
                ])
            writer.writerow([
                datetime.utcnow().isoformat(),
                payload.rating,
                payload.category,
                payload.recommendation_helpful,
                payload.body_shape_accurate,
                payload.skin_tone_accurate,
                payload.comments.replace("\n", " ").strip()
            ])
        return True
