from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
from werkzeug.utils import secure_filename
import PyPDF2
import docx2txt
import traceback

# Import job recommender functions
from job_recommender import (
    analyze_resume_type, 
    generate_smart_query, 
    fetch_jobs_from_serpapi,
    rank_jobs_domain_aware,
    save_to_csv
)

# Import configuration
from config import SERPAPI_API_KEY, DEFAULT_LOCATION, DEFAULT_TOP_RESULTS, DEFAULT_MODEL, ALLOWED_ORIGINS, ALLOW_ALL_ORIGINS, FLASK_PORT

app = Flask(__name__)
if ALLOW_ALL_ORIGINS:
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
else:
    CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_resume_text(file_path: str, file_extension: str) -> str:
    """Extract text from resume file based on its extension."""
    try:
        if file_extension == 'pdf':
            text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    text += page_text + "\n"
            return text.strip()

        elif file_extension == 'docx':
            return docx2txt.process(file_path)

        elif file_extension == 'txt':
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().strip()

        else:
            raise ValueError("Unsupported resume format. Use PDF, DOCX, or TXT.")
    except Exception as e:
        raise Exception(f"Error extracting text from {file_extension} file: {str(e)}")



@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'port': FLASK_PORT,
        'allowed_origins': '*' if ALLOW_ALL_ORIGINS else ALLOWED_ORIGINS
    })

@app.route('/upload', methods=['POST'])
def upload_resume():
    """Handle resume upload and job recommendation."""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400
        
        # Get location preference
        location = request.form.get('location', DEFAULT_LOCATION)
        
        # Check API key
        if not SERPAPI_API_KEY:
            return jsonify({'error': 'SerpApi API key not configured. Please check your configuration.'}), 500
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Extract text from resume
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400
            
            # Analyze resume type
            resume_analysis = analyze_resume_type(resume_text)
            
            # Generate smart query
            auto_query = generate_smart_query(resume_analysis, location=location)
            
            # Fetch jobs from SerpApi
            jobs = fetch_jobs_from_serpapi(auto_query, SERPAPI_API_KEY)
            
            if not jobs:
                return jsonify({
                    'success': True,
                    'message': 'Resume analyzed successfully, but no jobs found for the current query.',
                    'resume_analysis': format_resume_analysis(resume_analysis),
                    'query': auto_query,
                    'jobs_count': 0
                })
            
            # Rank jobs by similarity
            try:
                ranked_jobs = rank_jobs_domain_aware(resume_text, jobs, resume_analysis, model_name=DEFAULT_MODEL)
            except Exception as ranking_error:
                print(f"Error in job ranking: {str(ranking_error)}")
                # Fallback: use original jobs without ranking
                ranked_jobs = jobs
                for job in ranked_jobs:
                    job["similarity"] = 0.5
                    job["base_similarity"] = 0.5
                    job["domain_boost"] = 0.0
                    job["primary_domain"] = resume_analysis["primary_domain"]
                    job["subdomain"] = resume_analysis.get("subdomain", "")
            
            # Get top results
            top_jobs = ranked_jobs[:DEFAULT_TOP_RESULTS]
            
            # Save to CSV
            csv_filename = f"job_recommendations_{secure_filename(file.filename)}.csv"
            csv_path = os.path.join(os.getcwd(), csv_filename)
            save_to_csv(top_jobs, csv_path)
            
            # Prepare response data
            response_data = {
                'success': True,
                'message': 'Resume analyzed and jobs fetched successfully!',
                'resume_analysis': format_resume_analysis(resume_analysis),
                'query': auto_query,
                'location': location,
                'jobs_count': len(top_jobs),
                'extracted_text': resume_text[:1000] + '...' if len(resume_text) > 1000 else resume_text,
                'top_jobs': format_jobs_for_response(top_jobs),
                'csv_download': csv_filename
            }
            
            return jsonify(response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"Error processing resume: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'An error occurred while processing your resume: {str(e)}'}), 500

def format_resume_analysis(resume_analysis):
    """Format resume analysis for response."""
    return {
        'primary_domain': resume_analysis['primary_domain'].replace('_', ' ').title(),
        'subdomain': resume_analysis.get('subdomain', 'N/A').replace('_', ' ').title(),
        'primary_score': resume_analysis['primary_score'],
        'top_domains': [
            {
                'domain': domain.replace('_', ' ').title(),
                'score': data['score']
            } for domain, data in resume_analysis['top_domains']
        ],
        'detailed_analysis': {
            domain.replace('_', ' ').title(): {
                'score': data['score'],
                'keyword_matches': data['keyword_matches'],
                'framework_matches': data['framework_matches'],
                'tool_matches': data['tool_matches']
            } for domain, data in resume_analysis['all_domains'].items()
        }
    }

def format_jobs_for_response(top_jobs):
    """Format jobs for response."""
    return [
        {
            'title': job.get('title', ''),
            'company': job.get('company_name', ''),
            'location': job.get('location', ''),
            'source': job.get('via', ''),
            'similarity': round(job.get('similarity', 0.0) * 100, 2),
            'base_similarity': round(job.get('base_similarity', 0.0) * 100, 2),
            'domain_boost': round(job.get('domain_boost', 0.0) * 100, 2),
            'apply_link': job.get('share_link') or job.get('link') or '',
            'description': job.get('description', '')[:200] + '...' if job.get('description') else ''
        } for job in top_jobs
    ]

@app.route('/download/<filename>')
def download_csv(filename):
    """Download the generated CSV file."""
    try:
        file_path = os.path.join(os.getcwd(), filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True, download_name=filename)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Error downloading file: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=FLASK_PORT)
    