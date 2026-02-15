"""Health check endpoint."""
from flask import Blueprint, jsonify
import os

from config import ALLOW_ALL_ORIGINS, ALLOWED_ORIGINS, FLASK_PORT

bp = Blueprint('health', __name__)


@bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'mode': 'stateless',
        'description': 'API processes data for recommendations without storing user data',
        'port': os.environ.get("PORT", FLASK_PORT),
        'allowed_origins': '*' if ALLOW_ALL_ORIGINS else ALLOWED_ORIGINS,
        'gemini_configured': bool(os.getenv("GEMINI_API_KEY")),
        'youtube_configured': bool(os.getenv("YOUTUBE_API_KEY"))
    })
