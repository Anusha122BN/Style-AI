import json
from typing import List, Dict, Any, Tuple, Optional
from app.config import DRESS_KB_FILE
from app.schemas import DressRecommendationItem, ShoppingLinks
from app.engines.shopping import ShoppingEngine

class DressAdvisor:
    def __init__(self):
        with open(DRESS_KB_FILE, "r", encoding="utf-8") as f:
            self.dress_kb: List[Dict[str, Any]] = json.load(f)

    def recommend(
        self,
        gender: str,
        body_shape: str,
        selected_category: Optional[str] = None,
        selected_categories: Optional[List[str]] = None,
        selected_occasions: Optional[List[str]] = None,
        budget_tier: Optional[str] = None,
        favorite_colors: Optional[List[str]] = None
    ) -> Tuple[List[DressRecommendationItem], List[DressRecommendationItem]]:
        """
        Recommends suitable silhouettes and outfits based on body shape and personal preferences.
        STRICT FILTERING RULE:
        If `selected_category` or `selected_categories` is specified (e.g. 'Traditional Wear', 'Western Wear', 'Office Wear'),
        ONLY items belonging to that category are included. Irrelevant categories are strictly excluded.
        """
        norm_gender = gender.lower()
        if norm_gender not in ["men", "women"]:
            norm_gender = "women" # Default fallback

        # Build list of active category filters (case-insensitive)
        active_categories = []
        if selected_category and selected_category.lower() not in ["all", "any", ""]:
            active_categories.append(selected_category.strip().lower())
        if selected_categories:
            for c in selected_categories:
                if c and c.lower() not in ["all", "any", ""]:
                    active_categories.append(c.strip().lower())
        # Deduplicate
        active_categories = list(set(active_categories))

        recommended_items: List[DressRecommendationItem] = []
        carefully_considered_items: List[DressRecommendationItem] = []

        for item in self.dress_kb:
            if item["gender"].lower() != norm_gender:
                continue

            # Item categories
            item_cats = [c.lower() for c in item.get("categories", [item.get("category", "")])]

            # STRICT CATEGORY FILTERING RULE:
            # If active categories exist, item MUST match at least one selected category.
            if active_categories:
                matches_category = any(ac in item_cats for ac in active_categories)
                if not matches_category:
                    continue # Strictly omit garments that do not belong to user's selected category

            is_shape_compatible = body_shape in item.get("recommended_shapes", [])
            is_avoid_shape = body_shape in item.get("avoid_shapes", [])

            # Compute suitability score
            score = 0.72
            if is_shape_compatible:
                score += 0.20

            # Match occasions if specified
            if selected_occasions:
                matched_occ = any(occ.lower() in [o.lower() for o in item.get("occasions", [])] for occ in selected_occasions)
                if matched_occ:
                    score += 0.05

            # Match budget tier if specified
            if budget_tier and budget_tier.lower() != "all":
                item_budget = item.get("budget_tier", item.get("budget_category", "")).lower()
                if budget_tier.lower() in item_budget or item_budget in budget_tier.lower():
                    score += 0.03

            score = min(0.99, round(score, 2))

            # Primary color selection for shopping links
            primary_color = item["suitable_colors"][0] if item.get("suitable_colors") else ""
            if favorite_colors and any(fc in item.get("suitable_colors", []) for fc in favorite_colors):
                for fc in favorite_colors:
                    if fc in item.get("suitable_colors", []):
                        primary_color = fc
                        break

            # Effective category display name
            display_category = selected_category if (selected_category and selected_category.lower() not in ["all", "any"]) else item.get("category", item_cats[0].title() if item_cats else "")

            links = ShoppingEngine.generate_links(
                query=item.get("shop_queries", item["name"]),
                category=display_category,
                color=primary_color,
                body_shape=body_shape,
                budget_tier=budget_tier or ""
            )

            rec_item = DressRecommendationItem(
                id=item["id"],
                name=item["name"],
                gender=item["gender"],
                category=display_category,
                clothing_type=item.get("clothing_type", item["name"]),
                fit=item["fit"],
                neckline=item["neckline"],
                sleeve=item["sleeve"],
                fabric=item["fabric"],
                proportions_complemented=item["proportions_complemented"],
                suitable_colors=item["suitable_colors"],
                occasions=item["occasions"],
                budget_category=item.get("budget_tier", item.get("budget_category", "Mid-range (₹2,000 - ₹5,000)")),
                price_range_inr=item.get("price_range_inr", "₹1,499 - ₹2,999"),
                image_url=item["image_url"],
                shopping_links=links,
                why_suits_body=f"Engineered to flatter {body_shape} proportions: {item['proportions_complemented']}",
                suitability_score=score,
                is_carefully_considered=is_avoid_shape
            )

            if is_avoid_shape:
                rec_item.is_carefully_considered = True
                rec_item.consideration_reason = (
                    f"This cut may alter balance for a {body_shape} frame by placing excess horizontal volume "
                    f"or obscuring natural structural contours. Consider styling with a balancing belt or structured layer."
                )
                carefully_considered_items.append(rec_item)
            else:
                recommended_items.append(rec_item)

        # Sort recommended by suitability score descending
        recommended_items.sort(key=lambda x: x.suitability_score, reverse=True)
        return recommended_items, carefully_considered_items
