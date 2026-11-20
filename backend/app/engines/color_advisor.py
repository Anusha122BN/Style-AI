from typing import Dict, List, Any

class ColorAdvisor:
    """
    Generates personalized color palettes based on skin tone and undertone.
    Provides Hex codes and descriptive shade names across wardrobe, festive, formal, and accessories.
    """

    @staticmethod
    def generate_palette(monk_tone_id: str = "MST-04", undertone: str = "Warm") -> Dict[str, List[Dict[str, str]]]:
        undertone = undertone.capitalize()

        if undertone == "Warm":
            best_clothing = [
                {"name": "Warm Terracotta", "hex": "#E07A5F"},
                {"name": "Champagne Gold", "hex": "#D4AF37"},
                {"name": "Olive Moss", "hex": "#556B2F"},
                {"name": "Mustard Saffron", "hex": "#E1AD01"},
                {"name": "Rich Camel", "hex": "#C19A6B"},
                {"name": "Warm Peach Coral", "hex": "#F4A261"}
            ]
            experiment_with = [
                {"name": "Peacock Teal", "hex": "#008080"},
                {"name": "Deep Plum", "hex": "#4A154B"},
                {"name": "Burnished Bronze", "hex": "#8C6239"}
            ]
            neutrals = [
                {"name": "Warm Ivory", "hex": "#FAF0E6"},
                {"name": "Cream Oatmeal", "hex": "#E3DAC9"},
                {"name": "Espresso Brown", "hex": "#3D2B1F"},
                {"name": "Warm Slate", "hex": "#4F5D75"}
            ]
            traditional_colors = [
                {"name": "Royal Maroon", "hex": "#800020"},
                {"name": "Zari Mustard", "hex": "#FFDB58"},
                {"name": "Emerald Silk", "hex": "#50C878"},
                {"name": "Rust Tangerine", "hex": "#D35400"}
            ]
            formal_colors = [
                {"name": "Midnight Warm Navy", "hex": "#1B2A4A"},
                {"name": "Rich Charcoal", "hex": "#36454F"},
                {"name": "Dark Cocoa", "hex": "#35281E"}
            ]
            accessories = [
                {"name": "Yellow Gold (18K)", "hex": "#FFD700"},
                {"name": "Warm Amber", "hex": "#FFBF00"},
                {"name": "Burnished Brass", "hex": "#CD7F32"}
            ]

        elif undertone == "Cool":
            best_clothing = [
                {"name": "Cobalt Royal Blue", "hex": "#0047AB"},
                {"name": "Emerald Jewel Green", "hex": "#046307"},
                {"name": "Cool Rose Petal", "hex": "#C75D81"},
                {"name": "Icy Lavender", "hex": "#E6E6FA"},
                {"name": "Ruby Crimson", "hex": "#9B111E"},
                {"name": "Deep Sapphire", "hex": "#0F52BA"}
            ]
            experiment_with = [
                {"name": "Electric Violet", "hex": "#8F00FF"},
                {"name": "Fuchsia Magenta", "hex": "#FF00FF"},
                {"name": "Mint Glaze", "hex": "#98FF98"}
            ]
            neutrals = [
                {"name": "Crisp Pure White", "hex": "#FFFFFF"},
                {"name": "Silver Heather Grey", "hex": "#D3D3D3"},
                {"name": "Jet Black", "hex": "#111111"},
                {"name": "Cool Navy", "hex": "#000080"}
            ]
            traditional_colors = [
                {"name": "Ruby Red", "hex": "#AA1E2B"},
                {"name": "Royal Magenta", "hex": "#8B008B"},
                {"name": "Peacock Blue", "hex": "#33A1C9"},
                {"name": "Deep Aubergine", "hex": "#3B0910"}
            ]
            formal_colors = [
                {"name": "Oxford Midnight Navy", "hex": "#0B132B"},
                {"name": "Steel Grey", "hex": "#4682B4"},
                {"name": "Onyx Black", "hex": "#1A1A1D"}
            ]
            accessories = [
                {"name": "Sterling Silver", "hex": "#C0C0C0"},
                {"name": "White Platinum", "hex": "#E5E4E2"},
                {"name": "Rose Gold", "hex": "#B76E79"}
            ]

        elif undertone == "Olive":
            best_clothing = [
                {"name": "Rich Khaki Green", "hex": "#6B8E23"},
                {"name": "Burnished Terracotta", "hex": "#CC4E46"},
                {"name": "Warm Ochre", "hex": "#CC7722"},
                {"name": "Spiced Amber", "hex": "#C68B59"},
                {"name": "Teal Cerulean", "hex": "#007BA7"},
                {"name": "Deep Aubergine", "hex": "#5A2A42"}
            ]
            experiment_with = [
                {"name": "Deep Coral Red", "hex": "#CD5B45"},
                {"name": "Tuscan Sun Yellow", "hex": "#FAD02C"},
                {"name": "Forest Fern", "hex": "#4D7C0F"}
            ]
            neutrals = [
                {"name": "Muted Flax Taupe", "hex": "#B38B6D"},
                {"name": "Warm Off-White", "hex": "#FDFBF7"},
                {"name": "Espresso Umber", "hex": "#362B28"},
                {"name": "Gunmetal Grey", "hex": "#2A3439"}
            ]
            traditional_colors = [
                {"name": "Mehendi Olive Green", "hex": "#556B2F"},
                {"name": "Deep Maroon Brocade", "hex": "#722F37"},
                {"name": "Copper Gold", "hex": "#B87333"},
                {"name": "Antique Mustard", "hex": "#C59B27"}
            ]
            formal_colors = [
                {"name": "Deep Pine Green", "hex": "#1B4D3E"},
                {"name": "Dark Indigo Navy", "hex": "#1F2937"},
                {"name": "Rich Taupe Suit", "hex": "#483C32"}
            ]
            accessories = [
                {"name": "Antique Brushed Brass", "hex": "#D4AF37"},
                {"name": "Burnished Copper", "hex": "#B87333"},
                {"name": "Raw Gold", "hex": "#CFB53B"}
            ]

        else: # Neutral
            best_clothing = [
                {"name": "Dusty Rose Pink", "hex": "#DCAE96"},
                {"name": "Classic Jade Green", "hex": "#00A86B"},
                {"name": "Soft Chambray Blue", "hex": "#779ECB"},
                {"name": "Plum Bordeaux", "hex": "#6E263D"},
                {"name": "Warm Stone", "hex": "#C8B6A6"},
                {"name": "Champagne Bisque", "hex": "#F1DDC9"}
            ]
            experiment_with = [
                {"name": "Canary Bright Yellow", "hex": "#FFEF00"},
                {"name": "Persian Indigo", "hex": "#32127A"},
                {"name": "Vibrant Salmon", "hex": "#FA8072"}
            ]
            neutrals = [
                {"name": "Soft Alabaster White", "hex": "#F2F0EB"},
                {"name": "Heather Taupe", "hex": "#8B8589"},
                {"name": "True Black", "hex": "#121212"},
                {"name": "Classic French Navy", "hex": "#1B365D"}
            ]
            traditional_colors = [
                {"name": "Wine Marsala", "hex": "#955251"},
                {"name": "Royal Gold", "hex": "#D4AF37"},
                {"name": "Peacock Royal Teal", "hex": "#008B8B"},
                {"name": "Crimson Zari", "hex": "#DC143C"}
            ]
            formal_colors = [
                {"name": "Classic Navy Blue", "hex": "#002060"},
                {"name": "Charcoal Grey", "hex": "#36454F"},
                {"name": "Midnight Black", "hex": "#0A0A0A"}
            ]
            accessories = [
                {"name": "Mixed Rose & Yellow Gold", "hex": "#E6C280"},
                {"name": "Polished Silver", "hex": "#E0E0E0"},
                {"name": "Champagne Crystal", "hex": "#F7E7CE"}
            ]

        return {
            "best_clothing": best_clothing,
            "experiment_with": experiment_with,
            "neutrals": neutrals,
            "traditional_colors": traditional_colors,
            "formal_colors": formal_colors,
            "accessories": accessories
        }
