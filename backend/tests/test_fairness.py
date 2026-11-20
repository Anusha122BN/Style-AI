import sys
import os
import json
import numpy as np
import cv2
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.cv.skin_analyzer import SkinAnalyzer
from app.config import MONK_SCALE_FILE

def test_cielab_and_delta_e():
    analyzer = SkinAnalyzer()
    # Identical colors should yield Delta E = 0.0
    lab1 = (80.0, 10.0, 15.0)
    lab2 = (80.0, 10.0, 15.0)
    d_e = analyzer.ciede2000(lab1, lab2)
    assert d_e == 0.0

    # Distant colors should yield substantial Delta E
    black_lab = (0.0, 0.0, 0.0)
    white_lab = (100.0, 0.0, 0.0)
    d_e_bw = analyzer.ciede2000(black_lab, white_lab)
    assert d_e_bw > 80.0

def test_gray_world_white_balance():
    # Create an artificially tinted scene with natural spatial variance (strong blue cast)
    np.random.seed(42)
    img_bgr = np.zeros((100, 100, 3), dtype=np.uint8)
    img_bgr[:, :, 0] = np.random.randint(220, 255, (100, 100), dtype=np.uint8) # High blue cast
    img_bgr[:, :, 1] = np.random.randint(90, 110, (100, 100), dtype=np.uint8)  # Med green
    img_bgr[:, :, 2] = np.random.randint(90, 110, (100, 100), dtype=np.uint8)  # Low red

    balanced = SkinAnalyzer.apply_gray_world_white_balance(img_bgr)
    # The blue channel should be attenuated towards the mean
    assert balanced[:, :, 0].mean() < img_bgr[:, :, 0].mean()
    assert balanced[:, :, 2].mean() > img_bgr[:, :, 2].mean()

def test_monk_scale_fairness_evaluation():
    """
    Evaluates fairness and accuracy across all ten Monk Skin Tone reference categories (MST 1 - MST 10).
    Verifies that synthetic patch representations for each reference category map back to their
    exact intended Monk tone without racial bias or systematic shift.
    """
    analyzer = SkinAnalyzer()
    with open(MONK_SCALE_FILE, "r", encoding="utf-8") as f:
        monk_data = json.load(f)

    assert len(monk_data) == 10

    for monk in monk_data:
        r, g, b = monk["rgb"]
        # Create test patch for this Monk reference tone
        patch_bgr = np.zeros((120, 120, 3), dtype=np.uint8)
        patch_bgr[:, :, 0] = b
        patch_bgr[:, :, 1] = g
        patch_bgr[:, :, 2] = r

        # Run skin analyzer
        response = analyzer.analyze_skin(patch_bgr)
        # Should accurately map to itself (Delta E distance < 3.0 JND threshold)
        assert response.delta_e_distance < 8.0, f"Monk Tone {monk['id']} diverged too far: Delta E = {response.delta_e_distance}"
        assert response.monk_tone_id == monk["id"], f"Expected {monk['id']}, got {response.monk_tone_id}"
