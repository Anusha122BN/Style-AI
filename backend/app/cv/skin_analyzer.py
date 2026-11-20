import json
import math
import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, Any, Tuple, List, Optional
from app.config import MONK_SCALE_FILE
from app.schemas import ColorComponent, SkinAnalysisResponse

class SkinAnalyzer:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        # Load Monk Scale Reference Data
        with open(MONK_SCALE_FILE, "r", encoding="utf-8") as f:
            self.monk_scale = json.load(f)

    @staticmethod
    def apply_gray_world_white_balance(img_bgr: np.ndarray) -> np.ndarray:
        """
        Gray-World Assumption Illumination Correction:
        Assumes average reflectance in the scene is achromatic (gray).
        Scales each color channel proportionally to remove chromatic casts.
        """
        img_float = img_bgr.astype(np.float32)
        # If the image has negligible spatial variation (e.g. uniform swatch or test patch), bypass Gray-World
        if float(np.std(img_float[:, :, 0])) < 1.0 and float(np.std(img_float[:, :, 1])) < 1.0:
            return img_bgr.copy()

        b_avg = np.mean(img_float[:, :, 0])
        g_avg = np.mean(img_float[:, :, 1])
        r_avg = np.mean(img_float[:, :, 2])

        gray_avg = (b_avg + g_avg + r_avg) / 3.0

        if b_avg > 0 and g_avg > 0 and r_avg > 0:
            scale_b = gray_avg / b_avg
            scale_g = gray_avg / g_avg
            scale_r = gray_avg / r_avg

            # Dampen extreme scale factors to prevent hyper-saturation
            scale_b = np.clip(scale_b, 0.75, 1.35)
            scale_g = np.clip(scale_g, 0.75, 1.35)
            scale_r = np.clip(scale_r, 0.75, 1.35)

            img_float[:, :, 0] *= scale_b
            img_float[:, :, 1] *= scale_g
            img_float[:, :, 2] *= scale_r

        balanced = np.clip(img_float, 0, 255).astype(np.uint8)
        return balanced

    @staticmethod
    def rgb_to_cielab(r: int, g: int, b: int) -> Tuple[float, float, float]:
        """Converts sRGB [0-255] to CIELAB (L*, a*, b*) using standard D65 illuminant with float32 precision."""
        pixel = np.float32([[[b / 255.0, g / 255.0, r / 255.0]]])
        lab = cv2.cvtColor(pixel, cv2.COLOR_BGR2Lab)
        l_star = float(lab[0, 0, 0])
        a_star = float(lab[0, 0, 1])
        b_star = float(lab[0, 0, 2])
        return round(l_star, 1), round(a_star, 1), round(b_star, 1)

    @staticmethod
    def ciede2000(lab1: Tuple[float, float, float], lab2: Tuple[float, float, float]) -> float:
        """
        Calculates color difference using CIEDE2000 formula (Delta E 2000),
        accounting for perceptual non-uniformities in CIELAB space.
        """
        L1, a1, b1 = lab1
        L2, a2, b2 = lab2

        avg_L = (L1 + L2) / 2.0
        C1 = math.sqrt(a1**2 + b1**2)
        C2 = math.sqrt(a2**2 + b2**2)
        avg_C = (C1 + C2) / 2.0

        G = 0.5 * (1.0 - math.sqrt((avg_C**7) / (avg_C**7 + 25.0**7 + 1e-9)))

        a1_prime = (1.0 + G) * a1
        a2_prime = (1.0 + G) * a2

        C1_prime = math.sqrt(a1_prime**2 + b1**2)
        C2_prime = math.sqrt(a2_prime**2 + b2**2)
        avg_C_prime = (C1_prime + C2_prime) / 2.0

        h1_prime = math.degrees(math.atan2(b1, a1_prime)) % 360.0
        h2_prime = math.degrees(math.atan2(b2, a2_prime)) % 360.0

        if abs(h1_prime - h2_prime) <= 180.0:
            delta_h_prime = h2_prime - h1_prime
        elif h2_prime <= h1_prime:
            delta_h_prime = h2_prime - h1_prime + 360.0
        else:
            delta_h_prime = h2_prime - h1_prime - 360.0

        delta_L_prime = L2 - L1
        delta_C_prime = C2_prime - C1_prime
        delta_H_prime = 2.0 * math.sqrt(C1_prime * C2_prime) * math.sin(math.radians(delta_h_prime / 2.0))

        if abs(h1_prime - h2_prime) <= 180.0:
            avg_H_prime = (h1_prime + h2_prime) / 2.0
        elif h1_prime + h2_prime < 360.0:
            avg_H_prime = (h1_prime + h2_prime + 360.0) / 2.0
        else:
            avg_H_prime = (h1_prime + h2_prime - 360.0) / 2.0

        T = (1.0 - 0.17 * math.cos(math.radians(avg_H_prime - 30.0))
             + 0.24 * math.cos(math.radians(2.0 * avg_H_prime))
             + 0.32 * math.cos(math.radians(3.0 * avg_H_prime + 6.0))
             - 0.20 * math.cos(math.radians(4.0 * avg_H_prime - 63.0)))

        S_L = 1.0 + (0.015 * ((avg_L - 50.0)**2)) / math.sqrt(20.0 + (avg_L - 50.0)**2)
        S_C = 1.0 + 0.045 * avg_C_prime
        S_H = 1.0 + 0.015 * avg_C_prime * T

        delta_theta = 30.0 * math.exp(-(((avg_H_prime - 275.0) / 25.0)**2))
        R_C = 2.0 * math.sqrt((avg_C_prime**7) / (avg_C_prime**7 + 25.0**7 + 1e-9))
        R_T = -math.sin(math.radians(2.0 * delta_theta)) * R_C

        k_L = 1.0
        k_C = 1.0
        k_H = 1.0

        delta_E = math.sqrt(
            (delta_L_prime / (k_L * S_L))**2 +
            (delta_C_prime / (k_C * S_C))**2 +
            (delta_H_prime / (k_H * S_H))**2 +
            R_T * (delta_C_prime / (k_C * S_C)) * (delta_H_prime / (k_H * S_H))
        )
        return round(float(delta_E), 2)

    def _analyze_from_landmarks(
        self,
        corrected_bgr: np.ndarray,
        landmarks,
        w: int,
        h: int
    ) -> SkinAnalysisResponse:
        """Computes CIELAB, Monk tone, and undertone from validated face landmarks."""
        # Forehead: landmark 10 / 151
        # Left cheek: landmark 234 / 116
        # Right cheek: landmark 454 / 345
        forehead_pt = (int(landmarks[10].x * w), int(landmarks[10].y * h))
        l_cheek_pt = (int(landmarks[234].x * w), int(landmarks[234].y * h))
        r_cheek_pt = (int(landmarks[454].x * w), int(landmarks[454].y * h))

        # Sample 15x15 pixel median patches around each ROI
        patch_r = max(4, int(w * 0.02))
        forehead_rgb = self._get_patch_color(corrected_bgr, forehead_pt, patch_r)
        l_cheek_rgb = self._get_patch_color(corrected_bgr, l_cheek_pt, patch_r)
        r_cheek_rgb = self._get_patch_color(corrected_bgr, r_cheek_pt, patch_r)

        # Average composite skin color
        comp_r = int((forehead_rgb[0] + l_cheek_rgb[0] + r_cheek_rgb[0]) / 3.0)
        comp_g = int((forehead_rgb[1] + l_cheek_rgb[1] + r_cheek_rgb[1]) / 3.0)
        comp_b = int((forehead_rgb[2] + l_cheek_rgb[2] + r_cheek_rgb[2]) / 3.0)

        comp_lab = self.rgb_to_cielab(comp_r, comp_g, comp_b)

        # Color consistency score (variance across sampled regions)
        diff_fl = np.linalg.norm(np.array(forehead_rgb) - np.array(l_cheek_rgb))
        diff_fr = np.linalg.norm(np.array(forehead_rgb) - np.array(r_cheek_rgb))
        consistency_score = round(max(0.0, min(1.0, 1.0 - (diff_fl + diff_fr) / 120.0)), 2)

        # Step 3: Match with 10 Monk Skin Tone scale categories
        best_monk = self.monk_scale[0]
        min_delta_e = 999.0

        for monk in self.monk_scale:
            monk_lab = tuple(monk["lab"])
            d_e = self.ciede2000(comp_lab, monk_lab)
            if d_e < min_delta_e:
                min_delta_e = d_e
                best_monk = monk

        # Step 4: Undertone Estimation
        L, a, b = comp_lab
        # Olive undertone check
        if b > 14.0 and a < 10.0 and (b - a) > 8.0:
            undertone = "Olive"
        elif b > 15.0 and (b - a) > 4.0:
            undertone = "Warm"
        elif a > 12.0 and (a - b) > 1.0:
            undertone = "Cool"
        elif abs(a - b) <= 6.0:
            undertone = "Neutral"
        else:
            undertone = "Warm" if b > a else "Cool"

        # Step 5: Lighting check
        mean_lum = float(L)
        if mean_lum < 35.0:
            lighting_quality = "Underexposed"
            lighting_rec = "Lighting is low. Recommend capturing in front of a soft light source or natural window."
        elif mean_lum > 88.0:
            lighting_quality = "Overexposed"
            lighting_rec = "Highlights appear washed out. Avoid harsh direct overhead lights."
        else:
            lighting_quality = "Optimal"
            lighting_rec = "Illumination is well-balanced for chromatic analysis."

        confidence = round(max(0.65, min(0.96, 1.0 - (min_delta_e / 40.0) * 0.3)), 2)

        return SkinAnalysisResponse(
            status="success",
            monk_tone_id=best_monk["id"],
            monk_tone_name=best_monk["name"],
            monk_tone_description=best_monk["description"],
            monk_hex=best_monk["hex"],
            user_skin_color=ColorComponent(
                r=comp_r, g=comp_g, b=comp_b,
                hex_code=f"#{comp_r:02x}{comp_g:02x}{comp_b:02x}",
                lab_l=comp_lab[0], lab_a=comp_lab[1], lab_b=comp_lab[2]
            ),
            forehead_color=ColorComponent(
                r=forehead_rgb[0], g=forehead_rgb[1], b=forehead_rgb[2],
                hex_code=f"#{forehead_rgb[0]:02x}{forehead_rgb[1]:02x}{forehead_rgb[2]:02x}",
                lab_l=self.rgb_to_cielab(*forehead_rgb)[0],
                lab_a=self.rgb_to_cielab(*forehead_rgb)[1],
                lab_b=self.rgb_to_cielab(*forehead_rgb)[2]
            ),
            left_cheek_color=ColorComponent(
                r=l_cheek_rgb[0], g=l_cheek_rgb[1], b=l_cheek_rgb[2],
                hex_code=f"#{l_cheek_rgb[0]:02x}{l_cheek_rgb[1]:02x}{l_cheek_rgb[2]:02x}",
                lab_l=self.rgb_to_cielab(*l_cheek_rgb)[0],
                lab_a=self.rgb_to_cielab(*l_cheek_rgb)[1],
                lab_b=self.rgb_to_cielab(*l_cheek_rgb)[2]
            ),
            right_cheek_color=ColorComponent(
                r=r_cheek_rgb[0], g=r_cheek_rgb[1], b=r_cheek_rgb[2],
                hex_code=f"#{r_cheek_rgb[0]:02x}{r_cheek_rgb[1]:02x}{r_cheek_rgb[2]:02x}",
                lab_l=self.rgb_to_cielab(*r_cheek_rgb)[0],
                lab_a=self.rgb_to_cielab(*r_cheek_rgb)[1],
                lab_b=self.rgb_to_cielab(*r_cheek_rgb)[2]
            ),
            color_consistency_score=consistency_score,
            estimated_undertone=undertone,
            delta_e_distance=min_delta_e,
            lighting_quality=lighting_quality,
            lighting_recommendation=lighting_rec,
            confidence=confidence,
            limitations="Analysis utilizes CIEDE2000 algorithm and Gray-World illumination correction. Environmental lighting and camera color science can cause minor variations.",
            recommended_palette=best_monk.get("clothing_palette", ["Navy", "Champagne", "Burgundy", "Forest Green"])
        )

    def analyze_skin(self, image_bgr: np.ndarray) -> SkinAnalysisResponse:
        """
        Samples forehead, left cheek, and right cheek.
        Applies Gray-World White Balance illumination correction.
        Maps against the 10 Monk Skin Tone reference categories via Delta E 2000.
        Calculates undertone (Warm, Cool, Neutral, Olive).
        """
        corrected_bgr = self.apply_gray_world_white_balance(image_bgr)
        h, w, _ = corrected_bgr.shape

        image_rgb = cv2.cvtColor(corrected_bgr, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(image_rgb)

        if not results.multi_face_landmarks:
            return self._sample_central_fallback(corrected_bgr)

        return self._analyze_from_landmarks(corrected_bgr, results.multi_face_landmarks[0].landmark, w, h)

    def analyze_face_from_full_body(
        self,
        image_bgr: np.ndarray,
        pose_landmarks: Optional[list] = None
    ) -> Tuple[bool, Optional[SkinAnalysisResponse], str]:
        """
        Extracts and analyzes facial skin tone from a full-body photograph.
        If a face is clearly visible, returns (True, SkinAnalysisResponse, note).
        If the face is missing, covered, or cropped, returns (False, None, note).
        NEVER fabricates or guesses facial skin tone.
        """
        img_h, img_w, _ = image_bgr.shape
        corrected_bgr = self.apply_gray_world_white_balance(image_bgr)

        # Strategy A: Use Pose landmarks to crop the head region for high-resolution FaceMesh
        if pose_landmarks:
            head_x = []
            head_y = []
            for idx in [0, 1, 2, 3, 4, 5, 6, 7, 8]:
                if idx < len(pose_landmarks):
                    lm = pose_landmarks[idx]
                    vis = lm.get("visibility", 0) if isinstance(lm, dict) else getattr(lm, "visibility", 0)
                    if vis > 0.25:
                        px = (lm.get("x") if isinstance(lm, dict) else getattr(lm, "x")) * img_w
                        py = (lm.get("y") if isinstance(lm, dict) else getattr(lm, "y")) * img_h
                        head_x.append(px)
                        head_y.append(py)

            if len(head_x) >= 2:
                margin_w = img_w * 0.12
                margin_h = img_h * 0.10
                min_x = max(0, int(min(head_x) - margin_w))
                max_x = min(img_w, int(max(head_x) + margin_w))
                min_y = max(0, int(min(head_y) - margin_h))
                max_y = min(img_h, int(max(head_y) + margin_h))

                if (max_x - min_x) >= 40 and (max_y - min_y) >= 40:
                    head_crop = corrected_bgr[min_y:max_y, min_x:max_x]
                    crop_rgb = cv2.cvtColor(head_crop, cv2.COLOR_BGR2RGB)
                    crop_res = self.face_mesh.process(crop_rgb)
                    if crop_res.multi_face_landmarks:
                        ch, cw, _ = head_crop.shape
                        resp = self._analyze_from_landmarks(head_crop, crop_res.multi_face_landmarks[0].landmark, cw, ch)
                        return True, resp, "Facial complexion analyzed directly from high-resolution head region."

        # Strategy B: Run FaceMesh on the full corrected image
        full_rgb = cv2.cvtColor(corrected_bgr, cv2.COLOR_BGR2RGB)
        full_res = self.face_mesh.process(full_rgb)
        if full_res.multi_face_landmarks:
            resp = self._analyze_from_landmarks(corrected_bgr, full_res.multi_face_landmarks[0].landmark, img_w, img_h)
            return True, resp, "Facial complexion analyzed from visible facial landmarks."

        # If neither detected a face:
        return False, None, "Facial region was not clearly visible in this photograph. Body shape analysis was completed successfully."

    def _get_patch_color(self, img_bgr: np.ndarray, center_pt: Tuple[int, int], radius: int) -> Tuple[int, int, int]:
        h, w, _ = img_bgr.shape
        cx, cy = center_pt
        y1 = max(0, cy - radius)
        y2 = min(h, cy + radius)
        x1 = max(0, cx - radius)
        x2 = min(w, cx + radius)
        patch = img_bgr[y1:y2, x1:x2]
        if patch.size == 0:
            return (180, 150, 130)
        # Median color is resilient against blemishes and micro-shadows
        median_b = int(np.median(patch[:, :, 0]))
        median_g = int(np.median(patch[:, :, 1]))
        median_r = int(np.median(patch[:, :, 2]))
        return (median_r, median_g, median_b)

    def _sample_central_fallback(self, img_bgr: np.ndarray) -> SkinAnalysisResponse:
        """Fallback when facial mesh points are obscured on standalone skin upload."""
        h, w, _ = img_bgr.shape
        cy, cx = h // 2, w // 2
        r = max(10, int(w * 0.05))
        rgb = self._get_patch_color(img_bgr, (cx, cy), r)
        lab = self.rgb_to_cielab(*rgb)

        best_monk = self.monk_scale[4] # Default mid-tier
        min_d = 999.0
        for m in self.monk_scale:
            d = self.ciede2000(lab, tuple(m["lab"]))
            if d < min_d:
                min_d = d
                best_monk = m

        comp_component = ColorComponent(
            r=rgb[0], g=rgb[1], b=rgb[2],
            hex_code=f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}",
            lab_l=lab[0], lab_a=lab[1], lab_b=lab[2]
        )

        return SkinAnalysisResponse(
            status="fallback",
            monk_tone_id=best_monk["id"],
            monk_tone_name=best_monk["name"],
            monk_tone_description=best_monk["description"],
            monk_hex=best_monk["hex"],
            user_skin_color=comp_component,
            forehead_color=comp_component,
            left_cheek_color=comp_component,
            right_cheek_color=comp_component,
            color_consistency_score=0.75,
            estimated_undertone="Warm",
            delta_e_distance=min_d,
            lighting_quality="Acceptable",
            lighting_recommendation="Face mesh was partially obscured; sampled center region.",
            confidence=0.70,
            limitations="Fallback central patch sample used.",
            recommended_palette=best_monk.get("clothing_palette", [])
        )
