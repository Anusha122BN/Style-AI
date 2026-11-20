import uuid
from datetime import datetime, timedelta
import sqlite3
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas import (
    UserSignupRequest,
    UserLoginRequest,
    AuthTokenResponse,
    UserProfileUpdate,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.auth.security import (
    get_user_by_email,
    create_user,
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    update_user_profile,
    delete_user_account
)
from app.config import DB_PATH

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignupRequest):
    email_clean = payload.email.lower().strip()
    existing = get_user_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )
    hashed_pwd = get_password_hash(payload.password)
    try:
        user = create_user(
            full_name=payload.full_name.strip(),
            email=email_clean,
            hashed_pwd=hashed_pwd,
            gender=payload.gender_preference or "Women",
            height=payload.height_cm or 168.0
        )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account due to a database error."
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile after registration."
        )

    token = create_access_token({"sub": user["email"], "uid": user["id"]})
    clean_user = {k: v for k, v in user.items() if k != "hashed_password"}
    return AuthTokenResponse(access_token=token, user=clean_user)

@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: UserLoginRequest):
    email_clean = payload.email.lower().strip()
    user = get_user_by_email(email_clean)
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials. Please verify your details."
        )
    token = create_access_token({"sub": user["email"], "uid": user["id"]})
    clean_user = {k: v for k, v in user.items() if k != "hashed_password"}
    return AuthTokenResponse(access_token=token, user=clean_user)

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "hashed_password"}

@router.put("/profile")
async def update_profile(updates: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_updates = {}
    if updates.full_name is not None:
        user_updates["full_name"] = updates.full_name
    if updates.gender_preference is not None:
        user_updates["gender_preference"] = updates.gender_preference
    if updates.height_cm is not None:
        user_updates["height_cm"] = updates.height_cm

    current_prefs = current_user.get("preferences", {})
    if updates.preferred_styles is not None:
        current_prefs["preferred_styles"] = updates.preferred_styles
    if updates.occasions is not None:
        current_prefs["occasions"] = updates.occasions
    if updates.budget_tier is not None:
        current_prefs["budget_tier"] = updates.budget_tier
    if updates.favorite_colors is not None:
        current_prefs["favorite_colors"] = updates.favorite_colors
    if updates.wants_makeup is not None:
        current_prefs["wants_makeup"] = updates.wants_makeup
    if updates.preferred_platforms is not None:
        current_prefs["preferred_platforms"] = updates.preferred_platforms
    user_updates["preferences"] = current_prefs

    updated_user = update_user_profile(current_user["id"], user_updates)
    return {k: v for k, v in updated_user.items() if k != "hashed_password"}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = get_user_by_email(payload.email)
    # Generate token regardless to avoid user enumeration
    token = str(uuid.uuid4())[:8].upper()
    if user:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        expires = datetime.utcnow() + timedelta(hours=1)
        cur.execute("INSERT OR REPLACE INTO password_resets (email, reset_token, expires_at) VALUES (?, ?, ?)",
                    (payload.email.lower().strip(), token, expires))
        conn.commit()
        conn.close()
    return {
        "status": "success",
        "message": "If this email is registered, a password reset code has been issued.",
        "demo_reset_code": token # Helpful for local testing & viva presentation
    }

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT expires_at FROM password_resets WHERE email = ? AND reset_token = ?",
                (payload.email.lower().strip(), payload.reset_token.strip()))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
    
    expires_at = datetime.fromisoformat(row[0]) if isinstance(row[0], str) else row[0]
    if datetime.utcnow() > expires_at:
        cur.execute("DELETE FROM password_resets WHERE email = ?", (payload.email.lower().strip(),))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new one.")
    
    new_hash = get_password_hash(payload.new_password)
    cur.execute("UPDATE users SET hashed_password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
                (new_hash, payload.email.lower().strip()))
    cur.execute("DELETE FROM password_resets WHERE email = ?", (payload.email.lower().strip(),))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Password has been successfully updated. You may now log in."}

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Permanent account erasure fulfilling GDPR/Privacy-by-Design mandate."""
    success = delete_user_account(current_user["id"])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete account.")
    return {"status": "success", "message": "Account and all associated records have been permanently erased."}
