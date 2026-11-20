import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.auth.security import verify_password, get_password_hash

client = TestClient(app)

def test_password_hashing():
    pwd = "LuxuryFashionPassword2026!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_user_signup_and_login():
    test_email = "test.fashionista@styleai.com"
    signup_payload = {
        "full_name": "Seraphina Vance",
        "email": test_email,
        "password": "SecurePassword123!",
        "gender_preference": "Women",
        "height_cm": 170.0
    }
    # 1. Signup
    res = client.post("/api/auth/signup", json=signup_payload)
    if res.status_code == 400: # Already created in previous run
        pass
    else:
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_email

    # 2. Login
    login_payload = {
        "email": test_email,
        "password": "SecurePassword123!"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert len(token) > 20

    # 3. Protected route access
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == test_email
