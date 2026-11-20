import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app.engines.dress_advisor import DressAdvisor
from app.engines.shopping import ShoppingEngine

@pytest.fixture
def dress_advisor():
    return DressAdvisor()

def test_strict_category_filtering_traditional(dress_advisor):
    """
    STRICT FILTERING RULE:
    When 'Traditional Wear' is selected, ONLY traditional ethnic garments
    (Sarees, Anarkalis, Kurtis, Salwar suits, Lehengas, Kurtas, Nehru jackets)
    are returned. NEVER jeans, western dresses, blazers, or casual t-shirts.
    """
    recommended, careful = dress_advisor.recommend(
        gender="women",
        body_shape="Hourglass",
        selected_category="Traditional Wear"
    )

    assert len(recommended) > 0, "Should return traditional items for Hourglass women"

    for item in recommended:
        assert item.category.lower() == "traditional wear"
        # Ensure no western dresses or casual jeans leaked in
        name_lower = item.name.lower()
        assert "blazer" not in name_lower
        assert "denim" not in name_lower
        assert "t-shirt" not in name_lower
        assert "hoodie" not in name_lower

def test_strict_category_filtering_western(dress_advisor):
    """
    STRICT FILTERING RULE:
    When 'Western Wear' is selected, ONLY western garments are returned.
    NEVER sarees, anarkalis, kurtis, lehengas, or traditional kurtas.
    """
    recommended, careful = dress_advisor.recommend(
        gender="women",
        body_shape="Hourglass",
        selected_category="Western Wear"
    )

    assert len(recommended) > 0, "Should return western items for Hourglass women"

    for item in recommended:
        assert item.category.lower() == "western wear"
        name_lower = item.name.lower()
        assert "saree" not in name_lower
        assert "kurti" not in name_lower
        assert "lehenga" not in name_lower
        assert "anarkali" not in name_lower

def test_strict_category_filtering_office(dress_advisor):
    """
    STRICT FILTERING RULE:
    Office wear returns blazers, formal shirts, trousers, pencil skirts, office dresses.
    NEVER heavy wedding outfits or party gowns.
    """
    recommended, careful = dress_advisor.recommend(
        gender="women",
        body_shape="Hourglass",
        selected_category="Office Wear"
    )

    assert len(recommended) > 0
    for item in recommended:
        assert item.category.lower() == "office wear"
        name_lower = item.name.lower()
        assert "lehenga" not in name_lower
        assert "sequined" not in name_lower

def test_strict_category_filtering_casual(dress_advisor):
    """
    STRICT FILTERING RULE:
    Casual wear returns t-shirts, straight denim, casual sundresses, relaxed shirts.
    NEVER formal business suits or wedding lehengas.
    """
    recommended, careful = dress_advisor.recommend(
        gender="women",
        body_shape="Pear",
        selected_category="Casual Wear"
    )

    assert len(recommended) > 0
    for item in recommended:
        assert item.category.lower() == "casual wear"
        name_lower = item.name.lower()
        assert "lehenga" not in name_lower
        assert "sherwani" not in name_lower
        assert "blazer suit" not in name_lower

def test_men_category_filtering(dress_advisor):
    """Test strict filtering for men's categories."""
    rec_trad, _ = dress_advisor.recommend(
        gender="men",
        body_shape="Trapezoid",
        selected_category="Traditional Wear"
    )
    assert len(rec_trad) > 0
    for item in rec_trad:
        assert item.gender == "men"
        assert item.category.lower() == "traditional wear"

    rec_offc, _ = dress_advisor.recommend(
        gender="men",
        body_shape="Trapezoid",
        selected_category="Office Wear"
    )
    assert len(rec_offc) > 0
    for item in rec_offc:
        assert item.gender == "men"
        assert item.category.lower() == "office wear"

def test_category_switching_without_reupload(dress_advisor):
    """
    User can switch from Traditional to Western to Office instantaneously
    using cached body measurements without needing to re-upload photos.
    """
    # 1. First user requests Traditional Wear
    trad_recs, _ = dress_advisor.recommend(
        gender="women",
        body_shape="Pear",
        selected_category="Traditional Wear"
    )
    trad_ids = {r.id for r in trad_recs}

    # 2. User switches to Western Wear
    west_recs, _ = dress_advisor.recommend(
        gender="women",
        body_shape="Pear",
        selected_category="Western Wear"
    )
    west_ids = {r.id for r in west_recs}

    # 3. Recommendations must update distinctly and immediately
    assert trad_ids != west_ids, "Different categories must yield completely distinct recommendation sets"
    assert len(trad_recs) > 0
    assert len(west_recs) > 0

def test_shopping_links_generation():
    """Verify ShoppingEngine creates valid encoded URLs for all 5 retail platforms."""
    links = ShoppingEngine.generate_links(
        query="Chanderi Silk A-Line Kurti",
        category="Traditional Wear",
        color="Maroon",
        body_shape="Pear",
        budget_tier="Budget-friendly"
    )

    assert "myntra.com" in links.myntra
    assert "ajio.com" in links.ajio
    assert "meesho.com" in links.meesho
    assert "flipkart.com" in links.flipkart
    assert "amazon.in" in links.amazon
    assert "maroon" in links.ajio.lower()

def test_single_photo_endpoint_full_flow():
    import io
    import cv2
    import numpy as np
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    
    # Create test image with pattern
    img = np.zeros((400, 300, 3), dtype=np.uint8)
    img[::2, ::2] = 200
    img[1::2, 1::2] = 120
    _, encoded = cv2.imencode('.jpg', img)
    image_bytes = io.BytesIO(encoded.tobytes())

    response = client.post(
        "/api/cv/analyze-single-photo",
        files={"image": ("test.jpg", image_bytes, "image/jpeg")},
        data={
            "gender": "women",
            "height_cm": "165.0",
            "category": "Traditional Wear",
            "budget_tier": "Mid-range (₹2,000 - ₹5,000)",
            "occasion": "All",
            "favorite_colors": "Maroon,Black",
            "wants_makeup": "true"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "measurements" in data
    assert "classification" in data
    assert data["selected_category"] == "Traditional Wear"
    assert len(data["recommended_dresses"]) > 0
    for d in data["recommended_dresses"]:
        assert d["category"].lower() == "traditional wear"
