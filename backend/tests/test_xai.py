import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.engines.xai_explainer import XAIExplainerEngine

def test_shap_feature_importance():
    explainer = XAIExplainerEngine()
    measurements = {
        "shoulder_to_hip_ratio": 0.82,
        "waist_to_hip_ratio": 0.68,
        "torso_to_leg_ratio": 0.62,
        "shoulder_width_cm": 35.0,
        "hip_width_cm": 42.0,
        "waist_width_cm": 28.5
    }

    shap_items = explainer.compute_shap_importance(
        measurements=measurements,
        gender="women",
        predicted_shape="Pear"
    )

    assert len(shap_items) > 0
    top_feature = shap_items[0]
    assert hasattr(top_feature, "importance_score")
    assert hasattr(top_feature, "user_feature_value")
    assert top_feature.direction in ["supports", "opposes"]

def test_counterfactual_explanation_boundaries():
    explainer = XAIExplainerEngine()
    measurements = {
        "shoulder_to_hip_ratio": 0.82,
        "waist_to_hip_ratio": 0.70
    }

    cfs = explainer.compute_counterfactuals(
        measurements=measurements,
        gender="women",
        current_shape="Pear"
    )

    assert len(cfs) >= 2
    # Verify counterfactual provides target shape and ratio changes
    cf_hourglass = next((c for c in cfs if c.target_shape == "Hourglass"), None)
    assert cf_hourglass is not None
    assert "shoulder_to_hip_ratio" in cf_hourglass.required_ratio_changes
    assert "delta" in cf_hourglass.required_ratio_changes["shoulder_to_hip_ratio"]
