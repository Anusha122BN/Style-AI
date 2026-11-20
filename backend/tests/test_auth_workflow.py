import os
import sys
import uuid
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

client = TestClient(app)

def test_complete_auth_lifecycle():
    unique_suffix = str(uuid.uuid4())[:8]
    test_email = f"stylist_{unique_suffix}@styleai.fashion"
    test_password = "SecureStylistPass2026!"
    test_name = "Style AI Stylist Test"

    # 1. Test Valid Registration
    signup_payload = {
        "full_name": test_name,
        "email": test_email,
        "password": test_password,
        "gender_preference": "Women",
        "height_cm": 172.5
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload)
    assert signup_res.status_code == 201, f"Signup failed: {signup_res.text}"
    signup_data = signup_res.json()
    assert "access_token" in signup_data
    assert signup_data["token_type"] == "bearer"
    assert signup_data["user"]["email"] == test_email
    assert signup_data["user"]["full_name"] == test_name
    assert "hashed_password" not in signup_data["user"]
    token = signup_data["access_token"]

    # 2. Test Duplicate Email Handling
    dup_res = client.post("/api/auth/signup", json=signup_payload)
    assert dup_res.status_code == 400
    dup_data = dup_res.json()
    assert "already exists" in dup_data.get("detail", "")

    # 3. Test Successful Login
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == test_email
    assert "hashed_password" not in login_data["user"]

    # 4. Test Incorrect Password Handling
    wrong_pwd_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "CompletelyWrongPassword!"
    })
    assert wrong_pwd_res.status_code == 401
    assert "Invalid email or password" in wrong_pwd_res.json().get("detail", "")

    # 5. Test Non-existent Email Login
    non_existent_res = client.post("/api/auth/login", json={
        "email": f"nonexistent_{unique_suffix}@styleai.fashion",
        "password": test_password
    })
    assert non_existent_res.status_code == 401
    assert "Invalid email or password" in non_existent_res.json().get("detail", "")

    # 6. Test Protected Route (/me) with Token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
    assert "hashed_password" not in me_data

    # 7. Test Protected Route without Token
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

    # 8. Test Validation Error (Invalid Email)
    invalid_email_res = client.post("/api/auth/signup", json={
        "full_name": test_name,
        "email": "notanemail",
        "password": test_password
    })
    assert invalid_email_res.status_code == 422
    assert "detail" in invalid_email_res.json()

    # 9. Test Delete Account (Privacy right to erasure)
    delete_res = client.delete("/api/auth/account", headers={"Authorization": f"Bearer {token}"})
    assert delete_res.status_code == 200
    assert delete_res.json()["status"] == "success"

    # 10. Confirm Account is Deleted
    post_del_login = client.post("/api/auth/login", json=login_payload)
    assert post_del_login.status_code == 401
