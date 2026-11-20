import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- Testing /api/health ---")
res = client.get("/api/health")
print("Health:", res.status_code, res.text)

print("\n--- Testing /api/auth/signup ---")
signup_payload = {
    "full_name": "Test Stylist",
    "email": "teststylist_debug@example.com",
    "password": "Password123!",
    "gender_preference": "Women",
    "height_cm": 168.0
}
res = client.post("/api/auth/signup", json=signup_payload)
print("Signup status:", res.status_code)
print("Signup headers:", dict(res.headers))
print("Signup body:", res.text)

print("\n--- Testing duplicate signup ---")
res_dup = client.post("/api/auth/signup", json=signup_payload)
print("Dup signup status:", res_dup.status_code)
print("Dup signup body:", res_dup.text)

print("\n--- Testing /api/auth/login ---")
login_payload = {
    "email": "teststylist_debug@example.com",
    "password": "Password123!"
}
res_login = client.post("/api/auth/login", json=login_payload)
print("Login status:", res_login.status_code)
print("Login body:", res_login.text)

print("\n--- Testing /api/auth/login wrong password ---")
res_wrong = client.post("/api/auth/login", json={"email": "teststylist_debug@example.com", "password": "WrongPassword"})
print("Wrong pwd status:", res_wrong.status_code)
print("Wrong pwd body:", res_wrong.text)
