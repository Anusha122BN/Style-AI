
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Security & JWT
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "local-development-only-change-this"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Database path
DB_PATH = Path(
    os.getenv(
        "SQLITE_DB_PATH",
        str(BASE_DIR / "fashion_advisor.db")
    )
)
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Privacy & Biometrics policy
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
ENABLE_IN_MEMORY_ONLY = True

# Data directories
DATA_DIR = BASE_DIR / "data"
DRESS_KB_FILE = DATA_DIR / "dress_knowledge_base.json"
MAKEUP_KB_FILE = DATA_DIR / "makeup_knowledge_base.json"
MONK_SCALE_FILE = DATA_DIR / "monk_scale.json"
FEEDBACK_CSV_FILE = BASE_DIR / "feedback" / "anonymous_feedback.csv"
