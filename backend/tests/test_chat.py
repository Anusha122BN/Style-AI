import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_multilingual_english():
    payload = {
        "message": "What dress should I wear for an Hourglass body shape?",
        "language": "en",
        "gender": "women",
        "body_shape": "Hourglass",
        "skin_tone": "Monk Tone 04",
        "undertone": "Warm"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "en"
    assert len(data["reply"]) > 20
    assert len(data["suggested_actions"]) > 0

def test_chat_multilingual_hindi():
    payload = {
        "message": "नमस्ते, मुझे पार्टी के लिए मेकअप बताओ",
        "language": "hi",
        "gender": "women",
        "body_shape": "Hourglass",
        "skin_tone": "Monk Tone 04",
        "undertone": "Warm"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "hi"
    assert len(data["reply"]) > 20

def test_chat_multilingual_auto_detect():
    payload = {
        "message": "Hola, ¿qué vestido me recomiendas para fiesta?",
        "language": "auto",
        "gender": "women"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "es"
    assert len(data["reply"]) > 20
