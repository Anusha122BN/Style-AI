import urllib.parse
from typing import Optional
from app.schemas import ShoppingLinks

class ShoppingEngine:
    """
    Constructs genuine, properly URL-encoded search links for leading e-commerce platforms:
    - Myntra
    - AJIO
    - Meesho
    - Flipkart
    - Amazon India
    """

    @staticmethod
    def generate_links(
        query: str,
        category: str = "",
        color: str = "",
        body_shape: str = "",
        budget_tier: str = ""
    ) -> ShoppingLinks:
        tokens = []
        if color and color.lower() not in query.lower():
            tokens.append(color)
        tokens.append(query)
        if category and category.lower() not in query.lower():
            tokens.append(category)

        full_query = " ".join(tokens).strip()
        encoded_query = urllib.parse.quote_plus(full_query)
        
        # Clean slug for Myntra routing (lowercase alphanumeric with hyphens)
        clean_slug = full_query.lower()
        for char in [",", "&", "(", ")", "/", "'", '"', "."]:
            clean_slug = clean_slug.replace(char, " ")
        dash_encoded = urllib.parse.quote("-".join(clean_slug.split()))

        return ShoppingLinks(
            myntra=f"https://www.myntra.com/{dash_encoded}",
            ajio=f"https://www.ajio.com/search/?text={encoded_query}",
            meesho=f"https://www.meesho.com/search?q={encoded_query}",
            flipkart=f"https://www.flipkart.com/search?q={encoded_query}",
            amazon=f"https://www.amazon.in/s?k={encoded_query}"
        )
