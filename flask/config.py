#!/usr/bin/env python3
"""
Configuration file for the Job Recommendation System.
Set your API keys and preferences here.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# API Configuration
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")

# CORS / Server
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://localhost:8081"
).split(",") if origin.strip()]
ALLOW_ALL_ORIGINS = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true"
FLASK_PORT = int(os.getenv("FLASK_PORT", "5001"))

# Default Settings
DEFAULT_LOCATION = os.getenv("DEFAULT_LOCATION", "Bangalore")
DEFAULT_TOP_RESULTS = int(os.getenv("DEFAULT_TOP_RESULTS", "10"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "all-MiniLM-L6-v2")

# Check if API key is configured
def check_api_key():
    """Check if the API key is properly configured."""
    if not SERPAPI_API_KEY:
        print("⚠️  WARNING: SerpApi API key not configured!")
        print("   Please set your API key in one of these ways:")
        print("   1. Create a .env file and set SERPAPI_API_KEY=your_key")
        print("   2. Set environment variable: $env:SERPAPI_API_KEY='your_key'")
        print("   3. Get free API key from: https://serpapi.com")
        return False
    else:
        print("✅ SerpApi API key is configured successfully!")
        print(f"   API Key: {SERPAPI_API_KEY[:20]}...")
        return True

if __name__ == "__main__":
    check_api_key()
