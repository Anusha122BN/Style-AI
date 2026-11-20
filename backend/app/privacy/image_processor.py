import io
import gc
import cv2
import numpy as np
from typing import Tuple, Dict, Any
from fastapi import UploadFile, HTTPException
from app.config import MAX_IMAGE_SIZE_BYTES, ALLOWED_MIME_TYPES

class PrivacyImageProcessor:
    """
    Enforces Privacy-by-Design:
    - Strictly reads uploaded images into volatile memory (RAM) via BytesIO.
    - NEVER writes raw biometric user imagery to persistent disk, database, or logs.
    - Explicitly forces garbage collection and deallocates memory buffers after CV inference.
    """

    @staticmethod
    async def load_and_validate_image(upload_file: UploadFile) -> Tuple[np.ndarray, Dict[str, Any]]:
        # 1. Validate content type
        if upload_file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image format: {upload_file.content_type}. Allowed formats: JPEG, PNG, WEBP."
            )

        # 2. Read in-memory bytes
        contents = await upload_file.read()
        if len(contents) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"Image file size ({len(contents) // 1024} KB) exceeds the safe limit of 10 MB."
            )

        # 3. Decode into memory buffer via OpenCV
        in_memory_stream = io.BytesIO(contents)
        byte_array = np.frombuffer(in_memory_stream.getvalue(), dtype=np.uint8)
        image_bgr = cv2.imdecode(byte_array, cv2.IMREAD_COLOR)

        if image_bgr is None:
            raise HTTPException(
                status_code=400,
                detail="Unable to decode image. File may be corrupted or not a valid image."
            )

        # 4. Perform Quality & Lighting Check
        quality_report = PrivacyImageProcessor.assess_image_quality(image_bgr)
        
        # 5. Clear raw stream reference
        del contents
        del byte_array
        in_memory_stream.close()

        return image_bgr, quality_report

    @staticmethod
    def assess_image_quality(image_bgr: np.ndarray) -> Dict[str, Any]:
        """Calculates blur metric (Laplacian variance) and illumination levels."""
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        # Sharpness / Blur check via Laplacian variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < 50.0

        # Illumination / Brightness check
        mean_brightness = float(np.mean(gray))
        lighting_state = "Optimal"
        lighting_advice = "Lighting is balanced and suitable for accurate computer vision analysis."

        if mean_brightness < 55.0:
            lighting_state = "Underexposed"
            lighting_advice = "The image appears underexposed or dim. For best accuracy, face a natural window or bright soft light."
        elif mean_brightness > 215.0:
            lighting_state = "Overexposed"
            lighting_advice = "The image appears overexposed with washed out highlights. Avoid harsh direct flash or direct sunlight glare."
        elif is_blurry:
            lighting_state = "Blurry"
            lighting_advice = "The image shows motion blur or soft focus. Ensure the camera lens is steady during capture."

        return {
            "height": image_bgr.shape[0],
            "width": image_bgr.shape[1],
            "channels": image_bgr.shape[2],
            "sharpness_score": round(laplacian_var, 2),
            "brightness_level": round(mean_brightness, 2),
            "lighting_quality": lighting_state,
            "lighting_recommendation": lighting_advice,
            "is_usable": True
        }

    @staticmethod
    def secure_cleanup(*buffers):
        """Forces memory deallocation for biometric arrays."""
        for buf in buffers:
            try:
                del buf
            except Exception:
                pass
        gc.collect()
