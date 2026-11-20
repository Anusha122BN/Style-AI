import math
from typing import Dict, Any, Tuple
from app.schemas import BodyMeasurements, BodyShapeClassification

class BodyShapeClassifier:
    """
    Classifies body structure using anthropometric ratios:
    - Shoulder-to-Hip Ratio (SHR)
    - Waist-to-Hip Ratio (WHR)
    - Torso-to-Leg Ratio (TLR)
    
    Provides mathematical boundary explanations, uncertainty metrics,
    and proximity scores to alternative shapes.
    """

    FEMALE_THRESHOLDS = {
        "Hourglass": {"shr_min": 0.90, "shr_max": 1.10, "whr_max": 0.75},
        "Pear": {"shr_max": 0.90, "whr_max": 0.85},
        "Inverted Triangle": {"shr_min": 1.10},
        "Rectangle": {"shr_min": 0.90, "shr_max": 1.10, "whr_min": 0.75},
        "Apple": {"whr_min": 0.85}
    }

    MALE_THRESHOLDS = {
        "Trapezoid": {"shr_min": 1.05, "shr_max": 1.25, "whr_max": 0.88},
        "Inverted Triangle": {"shr_min": 1.25},
        "Rectangle": {"shr_min": 0.95, "shr_max": 1.05, "whr_min": 0.86},
        "Triangle": {"shr_max": 0.95},
        "Oval": {"whr_min": 0.92}
    }

    @classmethod
    def classify(cls, measurements: BodyMeasurements, gender: str = "women") -> BodyShapeClassification:
        is_male = gender.lower() == "men"
        shr = measurements.shoulder_to_hip_ratio
        whr = measurements.waist_to_hip_ratio

        if is_male:
            shape, confidence, explanation, proximities = cls._classify_male(shr, whr)
            thresholds = cls.MALE_THRESHOLDS
        else:
            shape, confidence, explanation, proximities = cls._classify_female(shr, whr)
            thresholds = cls.FEMALE_THRESHOLDS

        limitations = (
            "Body shape classification is an algorithmic approximation derived from 2D frontal keypoints "
            "calibrated with user height. It does not replace 3D body volume scanning or custom physical tailoring."
        )

        return BodyShapeClassification(
            detected_shape=shape,
            confidence=confidence,
            mathematical_basis=explanation,
            classification_thresholds=thresholds,
            ratio_summary={
                "shoulder_to_hip_ratio": shr,
                "waist_to_hip_ratio": whr,
                "torso_to_leg_ratio": measurements.torso_to_leg_ratio
            },
            alternative_shape_proximities=proximities,
            measurement_limitations=limitations
        )

    @classmethod
    def _classify_female(cls, shr: float, whr: float) -> Tuple[str, float, str, Dict[str, float]]:
        proximities = {
            "Hourglass": cls._calc_gaussian_proximity(shr, 1.0, 0.1) * cls._calc_sigmoid_proximity(whr, 0.74, -1),
            "Pear": cls._calc_sigmoid_proximity(shr, 0.90, -1),
            "Inverted Triangle": cls._calc_sigmoid_proximity(shr, 1.10, 1),
            "Rectangle": cls._calc_gaussian_proximity(shr, 1.0, 0.1) * cls._calc_sigmoid_proximity(whr, 0.76, 1),
            "Apple": cls._calc_sigmoid_proximity(whr, 0.85, 1)
        }

        # Normalize proximities to sum to 100%
        total = sum(proximities.values()) + 1e-6
        norm_proximities = {k: round((v / total) * 100.0, 1) for k, v in proximities.items()}

        if whr >= 0.85:
            shape = "Apple"
            conf = min(0.94, 0.75 + (whr - 0.85) * 1.2)
            basis = f"Waist-to-Hip Ratio (WHR = {whr:.2f}) exceeds the 0.85 threshold, indicating central torso prominence."
        elif shr < 0.90:
            shape = "Pear"
            conf = min(0.95, 0.75 + (0.90 - shr) * 1.5)
            basis = f"Shoulder-to-Hip Ratio (SHR = {shr:.2f}) is below 0.90, confirming that hips are proportionally wider than shoulders."
        elif shr > 1.10:
            shape = "Inverted Triangle"
            conf = min(0.95, 0.75 + (shr - 1.10) * 1.5)
            basis = f"Shoulder-to-Hip Ratio (SHR = {shr:.2f}) exceeds 1.10, indicating broad athletic shoulder lines."
        elif whr <= 0.75:
            shape = "Hourglass"
            conf = min(0.96, 0.78 + (0.75 - whr) * 1.8)
            basis = f"Balanced shoulder and hip width (SHR = {shr:.2f}) combined with a well-defined waist (WHR = {whr:.2f} <= 0.75)."
        else:
            shape = "Rectangle"
            conf = 0.84
            basis = f"Balanced shoulder and hip width (SHR = {shr:.2f}) with a straight, linear waist profile (WHR = {whr:.2f} > 0.75)."

        return shape, round(conf, 2), basis, norm_proximities

    @classmethod
    def _classify_male(cls, shr: float, whr: float) -> Tuple[str, float, str, Dict[str, float]]:
        proximities = {
            "Trapezoid": cls._calc_gaussian_proximity(shr, 1.15, 0.1) * cls._calc_sigmoid_proximity(whr, 0.85, -1),
            "Inverted Triangle": cls._calc_sigmoid_proximity(shr, 1.25, 1),
            "Rectangle": cls._calc_gaussian_proximity(shr, 1.0, 0.08) * cls._calc_sigmoid_proximity(whr, 0.87, 1),
            "Triangle": cls._calc_sigmoid_proximity(shr, 0.95, -1),
            "Oval": cls._calc_sigmoid_proximity(whr, 0.92, 1)
        }

        total = sum(proximities.values()) + 1e-6
        norm_proximities = {k: round((v / total) * 100.0, 1) for k, v in proximities.items()}

        if whr >= 0.92:
            shape = "Oval"
            conf = min(0.94, 0.75 + (whr - 0.92) * 1.5)
            basis = f"Waist-to-Hip Ratio (WHR = {whr:.2f}) exceeds 0.92, indicating rounded midsection proportion."
        elif shr < 0.95:
            shape = "Triangle"
            conf = min(0.94, 0.75 + (0.95 - shr) * 1.5)
            basis = f"Shoulder-to-Hip Ratio (SHR = {shr:.2f}) is below 0.95, indicating lower torso prominence."
        elif shr > 1.25:
            shape = "Inverted Triangle"
            conf = min(0.95, 0.78 + (shr - 1.25) * 1.5)
            basis = f"Athletic V-taper with Shoulder-to-Hip Ratio (SHR = {shr:.2f}) substantially exceeding 1.25."
        elif 1.05 <= shr <= 1.25 and whr <= 0.88:
            shape = "Trapezoid"
            conf = 0.91
            basis = f"Broad shoulders (SHR = {shr:.2f}) with athletic tapered waist (WHR = {whr:.2f} <= 0.88), embodying classic proportion."
        else:
            shape = "Rectangle"
            conf = 0.85
            basis = f"Linear torso profile where shoulder and hip widths are closely aligned (SHR = {shr:.2f})."

        return shape, round(conf, 2), basis, norm_proximities

    @staticmethod
    def _calc_gaussian_proximity(val: float, center: float, sigma: float) -> float:
        return math.exp(-((val - center) ** 2) / (2 * (sigma ** 2)))

    @staticmethod
    def _calc_sigmoid_proximity(val: float, threshold: float, direction: int) -> float:
        # direction = 1 for higher is better, -1 for lower is better
        k = 10.0
        return 1.0 / (1.0 + math.exp(-direction * k * (val - threshold)))
