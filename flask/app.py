"""Flask application: job recommendations, skill gap analysis, resume parsing."""
from flask import Flask
import os
import dotenv

from config import FLASK_PORT
from routes.health import bp as health_bp
from routes.skill_gap import bp as skill_gap_bp
from routes.jobs import bp as jobs_bp

dotenv.load_dotenv()

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Add CORS headers to every response (errors, timeouts handled by Render may not have them)."""
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
    """Preload job recommender (call after deploy to avoid cold-start timeout on first /upload-resume)."""
    try:
        from services import get_job_recommender
        get_job_recommender()
        return {"status": "ok", "message": "Job recommender warmed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

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
