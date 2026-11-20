import json

with open('backend/app/data/dress_knowledge_base.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cats = [
    'Traditional Wear', 'Western Wear', 'Office Wear', 'Casual Wear',
    'Party Wear', 'Wedding Wear', 'College Wear', 'Festive Wear',
    'Formal Wear', 'Ethnic Fusion'
]

print(f"Total items in KB: {len(data)}")
for g in ['women', 'men']:
    print(f"\n--- {g.upper()} ---")
    for c in cats:
        matching = [d for d in data if d["gender"] == g and c in d.get("categories", [])]
        print(f"  {c:18s}: {len(matching)} items -> {[m['id'] for m in matching]}")
