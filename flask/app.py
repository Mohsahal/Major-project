"""Flask application: job recommendations, skill gap analysis, resume parsing."""
from flask import Flask
from flask_cors import CORS
import os
import dotenv

from config import FLASK_PORT
from routes.health import bp as health_bp
from routes.skill_gap import bp as skill_gap_bp
from routes.jobs import bp as jobs_bp

dotenv.load_dotenv()

app = Flask(__name__)

# CORS: Flask-CORS only (no manual headers - avoids duplicate with Render proxy)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}}, supports_credentials=False)

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
