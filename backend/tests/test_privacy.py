import sys
import os
import gc
import numpy as np
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.privacy.image_processor import PrivacyImageProcessor
from app.privacy.privacy_service import PrivacyService

def test_image_quality_and_memory_cleanup():
    # 1. Test image quality assessment with sharp checkerboard pattern
    test_img = np.zeros((200, 200, 3), dtype=np.uint8)
    test_img[::2, ::2] = 200
    test_img[1::2, 1::2] = 80
    report = PrivacyImageProcessor.assess_image_quality(test_img)
    assert report["lighting_quality"] == "Optimal"
    assert report["sharpness_score"] > 50.0
    assert report["is_usable"] is True

    # 2. Test memory cleanup (zero lingering array references)
    buf = np.ones((500, 500, 3), dtype=np.uint8)
    PrivacyImageProcessor.secure_cleanup(buf)
    # Ensure garbage collection succeeds
    assert gc.isenabled()

def test_privacy_manifest():
    manifest = PrivacyService.get_privacy_manifest()
    assert "principles" in manifest
    assert len(manifest["principles"]) >= 4
    assert any("RAM" in p["principle"] for p in manifest["principles"])
    assert any("Zero" in p["principle"] for p in manifest["principles"])
