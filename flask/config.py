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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# CORS / Server
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://localhost:8081"
).split(",") if origin.strip()]
ALLOW_ALL_ORIGINS = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true"
FLASK_PORT = int(os.getenv("FLASK_PORT", "2000"))

# Default Settings
DEFAULT_LOCATION = os.getenv("DEFAULT_LOCATION", "Bangalore")
DEFAULT_TOP_RESULTS = int(os.getenv("DEFAULT_TOP_RESULTS", "10"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "all-MiniLM-L6-v2")

# Check if API keys are configured
def check_api_keys():
    """Check if the API keys are properly configured."""
    status = True
    
    if not SERPAPI_API_KEY:
        print("⚠️  WARNING: SerpApi API key not configured!")
        print("   Please set your API key in one of these ways:")
        print("   1. Create a .env file and set SERPAPI_API_KEY=your_key")
        print("   2. Set environment variable: $env:SERPAPI_API_KEY='your_key'")
        print("   3. Get free API key from: https://serpapi.com")
        status = False
    else:
        print("✅ SerpApi API key is configured successfully!")
        print(f"   API Key: {SERPAPI_API_KEY[:20]}...")
    
    if not GEMINI_API_KEY:
        print("⚠️  WARNING: Gemini API key not configured!")
        print("   Please set your API key in one of these ways:")
        print("   1. Create a .env file and set GEMINI_API_KEY=your_key")
        print("   2. Set environment variable: $env:GEMINI_API_KEY='your_key'")
        print("   3. Get API key from: https://makersuite.google.com/app/apikey")
        status = False
    else:
        print("✅ Gemini API key is configured successfully!")
        print(f"   API Key: {GEMINI_API_KEY[:20]}...")
    
    if not YOUTUBE_API_KEY:
        print("⚠️  WARNING: YouTube API key not configured!")
        print("   Please set your API key in one of these ways:")
        print("   1. Create a .env file and set YOUTUBE_API_KEY=your_key")
        print("   2. Set environment variable: $env:YOUTUBE_API_KEY='your_key'")
        print("   3. Get API key from: https://console.cloud.google.com/apis/credentials")
        status = False
    else:
        print("✅ YouTube API key is configured successfully!")
        print(f"   API Key: {YOUTUBE_API_KEY[:20]}...")
    
    return status

if __name__ == "__main__":
    check_api_keys()
