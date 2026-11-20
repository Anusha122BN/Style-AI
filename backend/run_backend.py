import uvicorn
import sys
import os

# Set stdout/stderr to UTF-8
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("[Style AI] Starting Explainable AI Fashion & Makeup Advisor Backend...")
    print("[Style AI] Privacy Mode: Volatile RAM Only (BytesIO) - Zero disk image retention")
    print("[Style AI] Listening on http://127.0.0.1:8000")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
