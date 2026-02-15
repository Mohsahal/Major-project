"""Flask application: job recommendations, skill gap analysis, resume parsing."""
from flask import Flask
import os
import threading
import dotenv

from config import FLASK_PORT
from routes.health import bp as health_bp
from routes.skill_gap import bp as skill_gap_bp
from routes.jobs import bp as jobs_bp

dotenv.load_dotenv()

app = Flask(__name__)


def _preload_job_recommender():
    try:
        from services import get_job_recommender
        get_job_recommender()
    except Exception:
        pass


@app.after_request
def add_cors_headers(response):
    """Add CORS headers to every response."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/<path:path>", methods=["OPTIONS"])
@app.route("/", methods=["OPTIONS"])
def options_handler(path=""):
    """Handle preflight for all routes."""
    return "", 204


@app.route("/warm", methods=["GET"])
def warm():
    """Return 200 immediately; preload job recommender in background (avoids Render 30s timeout)."""
    threading.Thread(target=_preload_job_recommender, daemon=True).start()
    return {"status": "ok", "message": "Preload started"}

app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

app.register_blueprint(health_bp)
app.register_blueprint(skill_gap_bp)
app.register_blueprint(jobs_bp)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", FLASK_PORT))
    print("\n" + "=" * 60)
    print("🚀 Starting Flask Server")
    print("=" * 60)
    print(f"📡 Port: {port}")
    print(f"🔧 Debug: {os.environ.get('FLASK_DEBUG', 'false')}")
    print("=" * 60 + "\n")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true",
        use_reloader=False,
        extra_files=[]
    )
