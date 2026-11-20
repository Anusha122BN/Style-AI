import cv2
import numpy as np
import base64
from typing import List, Dict, Any, Optional

class LandmarkVisualizer:
    """Renders elegant, luxury-styled landmark lines, measurement indicators, and privacy face protection."""

    @staticmethod
    def draw_body_analysis_overlay(
        image_bgr: np.ndarray,
        landmarks: List[Dict[str, Any]],
        measurements: Dict[str, Any],
        anonymize_face: bool = True
    ) -> str:
        overlay = image_bgr.copy()
        h, w, _ = overlay.shape

        # Privacy Protection: Soft blur/pixelate upper face region
        if anonymize_face and len(landmarks) > 0:
            try:
                nose_y = int(landmarks[0]["y"] * h)
                nose_x = int(landmarks[0]["x"] * w)
                radius = int(w * 0.12)
                y1 = max(0, nose_y - radius)
                y2 = min(h, nose_y + radius)
                x1 = max(0, nose_x - radius)
                x2 = min(w, nose_x + radius)
                face_roi = overlay[y1:y2, x1:x2]
                if face_roi.size > 0:
                    blurred = cv2.GaussianBlur(face_roi, (45, 45), 30)
                    overlay[y1:y2, x1:x2] = blurred
            except Exception:
                pass

        # MediaPipe standard skeleton connections for upper/lower body
        connections = [
            (11, 12), # shoulders
            (11, 23), (12, 24), # torso sides
            (23, 24), # hips
            (11, 13), (13, 15), # left arm
            (12, 14), (14, 16), # right arm
            (23, 25), (25, 27), # left leg
            (24, 26), (26, 28)  # right leg
        ]

        landmark_map = {lm["id"]: lm for lm in landmarks}

        # Draw luxury champagne-gold skeleton lines
        gold_color = (70, 180, 225) # BGR for gold
        accent_color = (80, 80, 220) # Coral / Rose gold accent

        for p1, p2 in connections:
            if p1 in landmark_map and p2 in landmark_map:
                lm1 = landmark_map[p1]
                lm2 = landmark_map[p2]
                if lm1["visibility"] > 0.4 and lm2["visibility"] > 0.4:
                    pt1 = (int(lm1["x"] * w), int(lm1["y"] * h))
                    pt2 = (int(lm2["x"] * w), int(lm2["y"] * h))
                    cv2.line(overlay, pt1, pt2, (230, 215, 180), 2, cv2.LINE_AA)

        # Draw joints as glowing rings
        for lm in landmarks:
            if lm["id"] in [11, 12, 23, 24, 25, 26, 27, 28] and lm["visibility"] > 0.4:
                pt = (int(lm["x"] * w), int(lm["y"] * h))
                cv2.circle(overlay, pt, 6, gold_color, -1, cv2.LINE_AA)
                cv2.circle(overlay, pt, 8, (255, 255, 255), 1, cv2.LINE_AA)

        # Draw horizontal measurement calipers
        if 11 in landmark_map and 12 in landmark_map:
            p_sh1 = (int(landmark_map[11]["x"] * w), int(landmark_map[11]["y"] * h))
            p_sh2 = (int(landmark_map[12]["x"] * w), int(landmark_map[12]["y"] * h))
            cv2.line(overlay, (p_sh1[0], p_sh1[1] - 15), (p_sh2[0], p_sh2[1] - 15), accent_color, 2, cv2.LINE_AA)
            cv2.putText(
                overlay,
                f"Shoulders: {measurements.get('shoulder_width_cm', '')} cm",
                (min(p_sh1[0], p_sh2[0]), min(p_sh1[1], p_sh2[1]) - 22),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

        if 23 in landmark_map and 24 in landmark_map:
            p_hp1 = (int(landmark_map[23]["x"] * w), int(landmark_map[23]["y"] * h))
            p_hp2 = (int(landmark_map[24]["x"] * w), int(landmark_map[24]["y"] * h))
            cv2.line(overlay, (p_hp1[0], p_hp1[1] + 15), (p_hp2[0], p_hp2[1] + 15), accent_color, 2, cv2.LINE_AA)
            cv2.putText(
                overlay,
                f"Hips: {measurements.get('hip_width_cm', '')} cm",
                (min(p_hp1[0], p_hp2[0]), max(p_hp1[1], p_hp2[1]) + 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

        # Encode to compressed base64 JPEG
        _, buffer = cv2.imencode('.jpg', overlay, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        base64_str = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_str}"
