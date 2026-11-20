import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas import BodyMeasurements
from app.engines.body_shape import BodyShapeClassifier

def test_female_body_shape_classifications():
    # 1. Hourglass (SHR ~ 1.0, WHR <= 0.75)
    m_hourglass = BodyMeasurements(
        height_cm=168.0, shoulder_width_cm=38.0, chest_width_cm=36.0,
        waist_width_cm=27.0, hip_width_cm=38.0, torso_length_cm=50.0,
        leg_length_cm=80.0, shoulder_to_hip_ratio=1.0, waist_to_hip_ratio=0.71,
        torso_to_leg_ratio=0.625
    )
    res_hg = BodyShapeClassifier.classify(m_hourglass, gender="women")
    assert res_hg.detected_shape == "Hourglass"
    assert res_hg.confidence >= 0.80

    # 2. Pear (SHR < 0.90, WHR < 0.85)
    m_pear = BodyMeasurements(
        height_cm=165.0, shoulder_width_cm=34.0, chest_width_cm=32.0,
        waist_width_cm=28.0, hip_width_cm=42.0, torso_length_cm=48.0,
        leg_length_cm=80.0, shoulder_to_hip_ratio=0.81, waist_to_hip_ratio=0.67,
        torso_to_leg_ratio=0.60
    )
    res_pear = BodyShapeClassifier.classify(m_pear, gender="women")
    assert res_pear.detected_shape == "Pear"

    # 3. Inverted Triangle (SHR > 1.10)
    m_inv_tri = BodyMeasurements(
        height_cm=172.0, shoulder_width_cm=43.0, chest_width_cm=40.0,
        waist_width_cm=30.0, hip_width_cm=36.0, torso_length_cm=52.0,
        leg_length_cm=82.0, shoulder_to_hip_ratio=1.19, waist_to_hip_ratio=0.83,
        torso_to_leg_ratio=0.63
    )
    res_inv = BodyShapeClassifier.classify(m_inv_tri, gender="women")
    assert res_inv.detected_shape == "Inverted Triangle"

    # 4. Apple (WHR >= 0.85)
    m_apple = BodyMeasurements(
        height_cm=160.0, shoulder_width_cm=38.0, chest_width_cm=38.0,
        waist_width_cm=35.0, hip_width_cm=39.0, torso_length_cm=48.0,
        leg_length_cm=75.0, shoulder_to_hip_ratio=0.97, waist_to_hip_ratio=0.90,
        torso_to_leg_ratio=0.64
    )
    res_apple = BodyShapeClassifier.classify(m_apple, gender="women")
    assert res_apple.detected_shape == "Apple"

    # 5. Rectangle (0.90 <= SHR <= 1.10 and WHR > 0.75)
    m_rect = BodyMeasurements(
        height_cm=168.0, shoulder_width_cm=37.0, chest_width_cm=35.0,
        waist_width_cm=30.0, hip_width_cm=37.0, torso_length_cm=50.0,
        leg_length_cm=80.0, shoulder_to_hip_ratio=1.0, waist_to_hip_ratio=0.81,
        torso_to_leg_ratio=0.625
    )
    res_rect = BodyShapeClassifier.classify(m_rect, gender="women")
    assert res_rect.detected_shape == "Rectangle"

def test_male_body_shape_classifications():
    # 1. Trapezoid (1.05 <= SHR <= 1.25 and WHR <= 0.88)
    m_trap = BodyMeasurements(
        height_cm=180.0, shoulder_width_cm=45.0, chest_width_cm=42.0,
        waist_width_cm=33.0, hip_width_cm=39.0, torso_length_cm=54.0,
        leg_length_cm=88.0, shoulder_to_hip_ratio=1.15, waist_to_hip_ratio=0.85,
        torso_to_leg_ratio=0.61
    )
    res_trap = BodyShapeClassifier.classify(m_trap, gender="men")
    assert res_trap.detected_shape == "Trapezoid"

    # 2. Inverted Triangle (SHR > 1.25)
    m_inv = BodyMeasurements(
        height_cm=182.0, shoulder_width_cm=48.0, chest_width_cm=44.0,
        waist_width_cm=32.0, hip_width_cm=37.0, torso_length_cm=55.0,
        leg_length_cm=90.0, shoulder_to_hip_ratio=1.30, waist_to_hip_ratio=0.86,
        torso_to_leg_ratio=0.61
    )
    res_inv = BodyShapeClassifier.classify(m_inv, gender="men")
    assert res_inv.detected_shape == "Inverted Triangle"

    # 3. Triangle (SHR < 0.95)
    m_tri = BodyMeasurements(
        height_cm=175.0, shoulder_width_cm=38.0, chest_width_cm=38.0,
        waist_width_cm=36.0, hip_width_cm=42.0, torso_length_cm=52.0,
        leg_length_cm=85.0, shoulder_to_hip_ratio=0.90, waist_to_hip_ratio=0.86,
        torso_to_leg_ratio=0.61
    )
    res_tri = BodyShapeClassifier.classify(m_tri, gender="men")
    assert res_tri.detected_shape == "Triangle"

    # 4. Oval (WHR >= 0.92)
    m_oval = BodyMeasurements(
        height_cm=174.0, shoulder_width_cm=41.0, chest_width_cm=41.0,
        waist_width_cm=42.0, hip_width_cm=43.0, torso_length_cm=52.0,
        leg_length_cm=84.0, shoulder_to_hip_ratio=0.95, waist_to_hip_ratio=0.98,
        torso_to_leg_ratio=0.62
    )
    res_oval = BodyShapeClassifier.classify(m_oval, gender="men")
    assert res_oval.detected_shape == "Oval"
