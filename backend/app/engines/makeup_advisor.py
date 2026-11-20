import json
from typing import List, Dict, Any, Optional
from app.config import MAKEUP_KB_FILE, MONK_SCALE_FILE
from app.schemas import MakeupRecommendationItem, OccasionMakeupLook, ShoppingLinks
from app.engines.shopping import ShoppingEngine

class MakeupAdvisor:
    def __init__(self):
        with open(MAKEUP_KB_FILE, "r", encoding="utf-8") as f:
            self.makeup_kb = json.load(f)
        with open(MONK_SCALE_FILE, "r", encoding="utf-8") as f:
            self.monk_scale = json.load(f)

    def recommend(
        self,
        monk_tone_id: str = "MST-04",
        undertone: str = "Warm",
        makeup_style: Optional[str] = "Office makeup"
    ) -> Dict[str, Any]:
        """
        Generates comprehensive makeup product and shade recommendations
        calibrated to Monk skin tone level and undertone.
        """
        # Determine numeric monk level (1 to 10)
        try:
            level = int(monk_tone_id.replace("MST-", ""))
        except Exception:
            level = 4

        undertone = undertone.capitalize()
        if undertone not in ["Warm", "Cool", "Neutral", "Olive"]:
            undertone = "Warm"

        # 1. Foundation Recommendation
        foundation_info = self._get_foundation_match(level, undertone)

        # 2. Lipstick Recommendations across requested shade families:
        # Nude, Brown, Pink, Red, Maroon, Berry, Peach, Mauve
        lipstick_recs = []
        for lip in self.makeup_kb.get("lipsticks", []):
            shade_family = lip["shade_family"]
            tone_data = lip.get(undertone) or lip.get("Warm")
            links = ShoppingEngine.generate_links(
                query=f"{tone_data['name']} lipstick {lip.get('search_query', '')}",
                category="Lipstick",
                color=shade_family
            )
            # Alternatives in other undertones
            alts = []
            for u in ["Warm", "Cool", "Neutral", "Olive"]:
                if u != undertone and u in lip:
                    alts.append({"undertone": u, "shade_name": lip[u]["name"], "hex": lip[u].get("hex", "#B77579")})

            lipstick_recs.append(MakeupRecommendationItem(
                product_category=f"Lipstick ({shade_family})",
                shade_name=tone_data["name"],
                hex_color=tone_data.get("hex"),
                undertone_match=f"Formulated for {undertone} undertones",
                explanation=tone_data["description"],
                alternative_shades=alts,
                recommended_finish="Velvet Matte / Satin Cream",
                shopping_links=links
            ))

        # 3. Eyeliner Recommendations
        eyeliner_recs = []
        for el in self.makeup_kb.get("eyeliners", []):
            links = ShoppingEngine.generate_links(
                query=el["search_query"],
                category="Eyeliner",
                color=el["shade"]
            )
            eyeliner_recs.append(MakeupRecommendationItem(
                product_category="Eyeliner",
                shade_name=el["shade"],
                hex_color=el.get("hex"),
                undertone_match="Universal High-Definition Pigment",
                explanation=el["best_for"],
                alternative_shades=[],
                recommended_finish="Waterproof Gel / Precision Liquid",
                shopping_links=links
            ))

        # 4. Eyeshadow Palettes
        eyeshadow_recs = []
        for es in self.makeup_kb.get("eyeshadow_palettes", []):
            links = ShoppingEngine.generate_links(
                query=es["search_query"],
                category="Eyeshadow Palette"
            )
            is_best = es.get("best_undertone") == undertone
            eyeshadow_recs.append(MakeupRecommendationItem(
                product_category="Eyeshadow Palette",
                shade_name=es["name"],
                hex_color=None,
                undertone_match=f"Best matched with {es.get('best_undertone')} undertones" + (" (Recommended)" if is_best else ""),
                explanation=f"{es['description']} Featuring: {', '.join(es['shades'])}.",
                alternative_shades=[{"palette": p["name"]} for p in self.makeup_kb.get("eyeshadow_palettes", []) if p["name"] != es["name"]],
                recommended_finish="Curated Matte & Foil Shimmer Duo",
                shopping_links=links
            ))

        # 5. Blush & Highlighter
        blush_item = next((b for b in self.makeup_kb.get("blushes", []) if b["undertone"] == undertone), self.makeup_kb["blushes"][0])
        blush_links = ShoppingEngine.generate_links(query=blush_item["search_query"], category="Blush", color=blush_item["shade"])
        blush_rec = MakeupRecommendationItem(
            product_category="Blush",
            shade_name=blush_item["shade"],
            hex_color=blush_item.get("hex"),
            undertone_match=f"Harmonizes naturally with {undertone} undertones",
            explanation=blush_item["description"],
            alternative_shades=[],
            recommended_finish="Buildable Micronized Powder",
            shopping_links=blush_links
        )

        hl_item = next((h for h in self.makeup_kb.get("highlighters", []) if h["undertone"] == undertone), self.makeup_kb["highlighters"][0])
        hl_links = ShoppingEngine.generate_links(query=hl_item["search_query"], category="Highlighter", color=hl_item["shade"])
        hl_rec = MakeupRecommendationItem(
            product_category="Highlighter",
            shade_name=hl_item["shade"],
            hex_color=hl_item.get("hex"),
            undertone_match=f"Seamless sheen for {undertone} tones",
            explanation=hl_item["description"],
            alternative_shades=[],
            recommended_finish="Baked Luminous Pearl",
            shopping_links=hl_links
        )

        all_products = [foundation_info, blush_rec, hl_rec] + lipstick_recs + eyeliner_recs + eyeshadow_recs

        # 6. Occasion Looks (Daily, College, Office, Party, Wedding, Traditional, Minimal, Glam)
        occasion_looks = []
        for occ_name, occ_data in self.makeup_kb.get("occasion_presets", {}).items():
            occ_links = ShoppingEngine.generate_links(query=f"{occ_name} makeup kit combo cosmetic", category="Beauty Kit")
            occasion_looks.append(OccasionMakeupLook(
                occasion=occ_name,
                focus=occ_data["focus"],
                base=occ_data["base"],
                eyes=occ_data["eyes"],
                cheeks=occ_data["cheeks"],
                lips=occ_data["lips"],
                shopping_links=occ_links
            ))

        return {
            "products": all_products,
            "occasion_looks": occasion_looks
        }

    def _get_foundation_match(self, level: int, undertone: str) -> MakeupRecommendationItem:
        bracket = None
        for b in self.makeup_kb.get("foundation_shades", []):
            if b["monk_range"][0] <= level <= b["monk_range"][1]:
                bracket = b
                break

        if not bracket:
            bracket = self.makeup_kb["foundation_shades"][1]

        ut_info = bracket["undertones"].get(undertone) or bracket["undertones"]["Warm"]
        links = ShoppingEngine.generate_links(query=ut_info["search_query"], category="Foundation")

        alts = []
        for u, d in bracket["undertones"].items():
            if u != undertone:
                alts.append({"undertone": u, "shade_name": d["shade_name"]})

        explanation = (
            f"Precision-matched for Monk Skin Tone depth Level {level} with a {undertone} undertone profile. "
            f"{ut_info['comparison']}."
        )

        return MakeupRecommendationItem(
            product_category="Foundation",
            shade_name=ut_info["shade_name"],
            hex_color=None,
            undertone_match=ut_info["undertone_match"],
            explanation=explanation,
            alternative_shades=alts,
            recommended_finish=ut_info.get("recommended_finish", "Satin Natural Finish"),
            shopping_links=links
        )
