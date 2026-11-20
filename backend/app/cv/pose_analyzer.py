import math
import numpy as np
import cv2
import mediapipe as mp
from typing import Dict, Any, Tuple, Optional
from app.schemas import BodyMeasurements, LandmarkPoint

class PoseAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5
        )

    def analyze_pose(
        self,
        image_bgr: np.ndarray,
        user_height_cm: float = 168.0,
        gender: str = "women"
    ) -> Tuple[BodyMeasurements, Dict[str, Any], list]:
        """
        Processes a full-body image using MediaPipe Pose.
        Applies height calibration to translate pixel coordinates into physical centimeters.
        Calculates anatomical proportions, widths, and structural ratios.
        """
        img_h, img_w, _ = image_bgr.shape
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)

        if not results.pose_landmarks:
            # If standard pose detection doesn't trigger (e.g. cropped/partial image),
            # provide a calibrated geometric estimation with transparent notice.
            return self._generate_fallback_measurements(user_height_cm, gender, img_w, img_h)

        landmarks = results.pose_landmarks.landmark
        
        # Key landmark extraction (MediaPipe Pose specification)
        # 11: left shoulder, 12: right shoulder
        # 23: left hip, 24: right hip
        # 25: left knee, 26: right knee
        # 27: left ankle, 28: right ankle
        # 0: nose
        l_sh = np.array([landmarks[11].x * img_w, landmarks[11].y * img_h])
        r_sh = np.array([landmarks[12].x * img_w, landmarks[12].y * img_h])
        l_hip = np.array([landmarks[23].x * img_w, landmarks[23].y * img_h])
        r_hip = np.array([landmarks[24].x * img_w, landmarks[24].y * img_h])
        l_ankle = np.array([landmarks[27].x * img_w, landmarks[27].y * img_h])
        r_ankle = np.array([landmarks[28].x * img_w, landmarks[28].y * img_h])
        nose = np.array([landmarks[0].x * img_w, landmarks[0].y * img_h])

        # Validate posture & visibility
        keypoint_visibilities = [
            landmarks[11].visibility, landmarks[12].visibility,
            landmarks[23].visibility, landmarks[24].visibility,
            landmarks[27].visibility, landmarks[28].visibility
        ]
        avg_confidence = float(np.mean(keypoint_visibilities))

        # Check upright alignment
        mid_shoulders = (l_sh + r_sh) / 2.0
        mid_hips = (l_hip + r_hip) / 2.0
        mid_ankles = (l_ankle + r_ankle) / 2.0

        torso_vector = mid_shoulders - mid_hips
        torso_angle_deg = abs(math.degrees(math.atan2(torso_vector[0], -torso_vector[1])))
        is_upright = torso_angle_deg < 25.0

        # Pixel height calculation (from crown/nose to ankles + head offset)
        head_top_y = max(0, nose[1] - abs(mid_shoulders[1] - nose[1]) * 0.7)
        pixel_height = abs(mid_ankles[1] - head_top_y)
        if pixel_height < 100:
            pixel_height = img_h * 0.85 # Fallback to framing proportion

        # Height Calibration: cm per pixel
        cm_per_pixel = user_height_cm / pixel_height

        # Pixel measurements
        shoulder_dist_px = np.linalg.norm(l_sh - r_sh)
        hip_dist_px = np.linalg.norm(l_hip - r_hip)
        torso_len_px = np.linalg.norm(mid_shoulders - mid_hips)
        leg_len_px = np.linalg.norm(mid_hips - mid_ankles)

        # Flesh & clothing boundary expansion factors
        # MediaPipe joints represent skeletal pivots; surface body width is wider:
        shoulder_width_cm = round(float(shoulder_dist_px * cm_per_pixel * 1.15), 1)
        hip_width_cm = round(float(hip_dist_px * cm_per_pixel * 1.25), 1)
        
        # Chest width estimated between shoulders and waist
        chest_width_cm = round(float(shoulder_width_cm * 0.94), 1)
        
        # Waist width estimation:
        # In natural human anatomy, waist sits roughly 60% down from shoulders to hips.
        # We calculate morphological waist width based on gender tendencies and joint landmarks:
        if gender.lower() == "men":
            waist_ratio_default = 0.84
        else:
            waist_ratio_default = 0.74

        waist_width_cm = round(float(hip_width_cm * waist_ratio_default), 1)
        
        torso_length_cm = round(float(torso_len_px * cm_per_pixel), 1)
        leg_length_cm = round(float(leg_len_px * cm_per_pixel), 1)

        # Derived Ratios
        sh_hip_ratio = round(float(shoulder_width_cm / max(hip_width_cm, 1.0)), 3)
        waist_hip_ratio = round(float(waist_width_cm / max(hip_width_cm, 1.0)), 3)
        torso_leg_ratio = round(float(torso_length_cm / max(leg_length_cm, 1.0)), 3)

        measurements = BodyMeasurements(
            height_cm=round(float(user_height_cm), 1),
            shoulder_width_cm=shoulder_width_cm,
            chest_width_cm=chest_width_cm,
            waist_width_cm=waist_width_cm,
            hip_width_cm=hip_width_cm,
            torso_length_cm=torso_length_cm,
            leg_length_cm=leg_length_cm,
            shoulder_to_hip_ratio=sh_hip_ratio,
            waist_to_hip_ratio=waist_hip_ratio,
            torso_to_leg_ratio=torso_leg_ratio,
            measurement_type="MediaPipe Pose Keypoints + User Height Calibration"
        )

        metadata = {
            "confidence": round(avg_confidence, 2),
            "is_upright": is_upright,
            "torso_angle_deg": round(torso_angle_deg, 1),
            "pixel_height": round(float(pixel_height), 1),
            "cm_per_pixel": round(float(cm_per_pixel), 4),
            "landmarks_detected": True
        }

        # Format key landmarks for visualization
        landmark_list = []
        for idx, lm in enumerate(landmarks):
            landmark_list.append({
                "id": idx,
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(lm.z),
                "visibility": float(lm.visibility)
            })

        return measurements, metadata, landmark_list

    def _generate_fallback_measurements(
        self,
        height_cm: float,
        gender: str,
        img_w: int,
        img_h: int
    ) -> Tuple[BodyMeasurements, Dict[str, Any], list]:
        """Graceful fallback when full skeleton isn't detected (e.g., partial crop or test pattern)."""
        is_male = gender.lower() == "men"
        if is_male:
            shoulder_cm = round(height_cm * 0.258, 1) # ~43 cm
            hip_cm = round(height_cm * 0.218, 1)      # ~36 cm
            waist_cm = round(hip_cm * 0.85, 1)        # ~31 cm
        else:
            shoulder_cm = round(height_cm * 0.230, 1) # ~38 cm
            hip_cm = round(height_cm * 0.245, 1)      # ~41 cm
            waist_cm = round(hip_cm * 0.74, 1)        # ~30 cm

        chest_cm = round(shoulder_cm * 0.94, 1)
        torso_cm = round(height_cm * 0.31, 1)
        leg_cm = round(height_cm * 0.49, 1)

        sh_hip_ratio = round(shoulder_cm / hip_cm, 3)
        waist_hip_ratio = round(waist_cm / hip_cm, 3)
        torso_leg_ratio = round(torso_cm / leg_cm, 3)

        measurements = BodyMeasurements(
            height_cm=height_cm,
            shoulder_width_cm=shoulder_cm,
            chest_width_cm=chest_cm,
            waist_width_cm=waist_cm,
            hip_width_cm=hip_cm,
            torso_length_cm=torso_cm,
            leg_length_cm=leg_cm,
            shoulder_to_hip_ratio=sh_hip_ratio,
            waist_to_hip_ratio=waist_hip_ratio,
            torso_to_leg_ratio=torso_leg_ratio,
            measurement_type="Anthropometric Geometric Estimation (Fallback)"
        )

        metadata = {
            "confidence": 0.60,
            "is_upright": True,
            "torso_angle_deg": 0.0,
            "pixel_height": float(img_h),
            "cm_per_pixel": float(height_cm / max(img_h, 1)),
            "landmarks_detected": False,
            "notice": "Full skeletal pose was partially obscured. Used anthropometric calibration model."
        }

        return measurements, metadata, []
