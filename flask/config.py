#!/usr/bin/env python3
"""
Configuration file for the Job Recommendation System.
Set your API keys and preferences here.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# ==========================
# API Configuration
# ==========================
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# ==========================
# Server Config
# ==========================
# Flask port (Render auto-assigns PORT env var, fallback to 2000 locally)
FLASK_PORT = int(os.getenv("PORT", os.getenv("FLASK_PORT", "2000")))

# CORS Configuration
ALLOW_ALL_ORIGINS = os.getenv("ALLOW_ALL_ORIGINS", "true").lower() == "true"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:8081").split(",") if not ALLOW_ALL_ORIGINS else []

# ==========================
# Default Settings
# ==========================
DEFAULT_LOCATION = os.getenv("DEFAULT_LOCATION", "Bangalore")
DEFAULT_TOP_RESULTS = int(os.getenv("DEFAULT_TOP_RESULTS", "10"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "all-MiniLM-L6-v2")

# ==========================
# API Key Checker
# ==========================
def check_api_keys():
    """Check if the API keys are properly configured."""
    status = True

    if not SERPAPI_API_KEY:
        print("⚠️  WARNING: SerpApi API key not configured!")
        status = False
    else:
        print("✅ SerpApi API key is configured.")

    if not GEMINI_API_KEY:
        print("⚠️  WARNING: Gemini API key not configured!")
        status = False
    else:
        print("✅ Gemini API key is configured.")

    if not YOUTUBE_API_KEY:
        print("⚠️  WARNING: YouTube API key not configured!")
        status = False
    else:
        print("✅ YouTube API key is configured.")

    return status


if __name__ == "__main__":
    check_api_keys()
