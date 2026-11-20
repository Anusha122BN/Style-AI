import sqlite3
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, DB_PATH

# Password hashing configuration (Argon2 with Bcrypt fallback)
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
security_bearer = HTTPBearer(auto_error=False)

def init_db():
    """Initializes the SQLite database tables if they do not exist."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            gender_preference TEXT DEFAULT 'Women',
            height_cm REAL DEFAULT 168.0,
            preferences_json TEXT DEFAULT '{}',
            last_body_shape TEXT DEFAULT NULL,
            last_skin_tone TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            email TEXT PRIMARY KEY,
            reset_token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Initialize DB on module load
init_db()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback manual check if needed
        import bcrypt
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        import bcrypt
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        user_dict = dict(row)
        try:
            user_dict["preferences"] = json.loads(user_dict.get("preferences_json") or "{}")
        except Exception:
            user_dict["preferences"] = {}
        return user_dict
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        user_dict = dict(row)
        try:
            user_dict["preferences"] = json.loads(user_dict.get("preferences_json") or "{}")
        except Exception:
            user_dict["preferences"] = {}
        return user_dict
    return None

def create_user(full_name: str, email: str, hashed_pwd: str, gender: str = "Women", height: float = 168.0) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (full_name, email, hashed_password, gender_preference, height_cm, preferences_json)
        VALUES (?, ?, ?, ?, ?, '{}')
    """, (full_name.strip(), email.lower().strip(), hashed_pwd, gender, height))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def update_user_profile(user_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    fields = []
    values = []
    
    if "full_name" in updates and updates["full_name"]:
        fields.append("full_name = ?")
        values.append(updates["full_name"].strip())
    if "gender_preference" in updates and updates["gender_preference"]:
        fields.append("gender_preference = ?")
        values.append(updates["gender_preference"])
    if "height_cm" in updates and updates["height_cm"]:
        fields.append("height_cm = ?")
        values.append(float(updates["height_cm"]))
    if "last_body_shape" in updates:
        fields.append("last_body_shape = ?")
        values.append(updates["last_body_shape"])
    if "last_skin_tone" in updates:
        fields.append("last_skin_tone = ?")
        values.append(updates["last_skin_tone"])
    if "preferences" in updates:
        fields.append("preferences_json = ?")
        values.append(json.dumps(updates["preferences"]))

    if fields:
        fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(user_id)
        sql = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(sql, tuple(values))
        conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def delete_user_account(user_id: int) -> bool:
    """Deletes all user profile data and settings completely (Privacy Right to Erasure)."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid authentication token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account no longer exists.",
        )
    return user
