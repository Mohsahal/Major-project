from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
from werkzeug.utils import secure_filename
import PyPDF2
import docx2txt
import traceback
from urllib.parse import urlparse
import re
import json
from datetime import datetime

# for skill gap analysis
# LangChain imports removed to improve startup time
# (Moved to lazy loading inside functions if needed)

# Import skill gap analyzer
# Import skill gap analyzer (Lazy loaded below)
# from skill_gap_analyzer import SkillGapAnalyzer

# Import job recommender
from job_recommender import JobRecommender

# Import job scraper (commented out - not needed for stateless mode)
# from job_scraper import JobScraper

import dotenv

# Import configuration
from config import ALLOWED_ORIGINS, ALLOW_ALL_ORIGINS, FLASK_PORT

app = Flask(__name__)
if ALLOW_ALL_ORIGINS:
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
else:
    # Explicitly allow all origins for debugging
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global Error Handlers (Ensure CORS headers are present on errors)
@app.errorhandler(500)
def handle_500(e):
    response = jsonify({'error': 'Internal Server Error', 'details': str(e)})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 500

@app.errorhandler(404)
def handle_404(e):
    response = jsonify({'error': 'Not Found'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 404

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# Load environment variables for skill gap analysis
dotenv.load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Initialize skill gap analyzer (lazy loading)
skill_analyzer = None

def get_skill_analyzer():
    """Get or initialize skill gap analyzer (singleton pattern)"""
    global skill_analyzer
    if skill_analyzer is None:
        print("🚀 Initializing SkillGapAnalyzer for the first time...")
        from skill_gap_analyzer import SkillGapAnalyzer
        skill_analyzer = SkillGapAnalyzer(GEMINI_API_KEY, YOUTUBE_API_KEY)
    return skill_analyzer

# Initialize job recommender (lazy loading to avoid reload on debug restart)
job_recommender = None

def get_job_recommender():
    """Get or initialize job recommender (singleton pattern)"""
    global job_recommender
    if job_recommender is None:
        print("🚀 Initializing JobRecommender for the first time...")
        job_recommender = JobRecommender()
    return job_recommender

# Initialize job scraper (commented out - not needed for stateless mode)
# job_scraper = JobScraper()

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



def analyze_skill_gap(resume_text, job_description):
    """Analyze skill gap between resume and job description."""
    try:
        if not GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY not configured")
        
        # First, extract skills from both resume and job description using a more direct approach
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.1,
            max_output_tokens=2000,
            google_api_key=GEMINI_API_KEY
        )
        
        # Step 1: Extract skills from job description
        job_skills_prompt = """
        Extract all technical skills, programming languages, frameworks, tools, and technologies mentioned in the job description.
        
        Job Description: {job_description}
        
        Return ONLY a JSON array of skill names, like this:
        ["Python", "React", "Docker", "AWS", "MongoDB"]
        
        Focus on:
        - Programming languages (Python, JavaScript, Java, etc.)
        - Frameworks (React, Angular, Django, Flask, etc.)
        - Databases (MySQL, MongoDB, PostgreSQL, etc.)
        - Cloud platforms (AWS, Azure, GCP, etc.)
        - Tools (Docker, Kubernetes, Git, Jenkins, etc.)
        - Methodologies (Agile, Scrum, DevOps, etc.)
        
        Only return the JSON array, no other text.
        """
        
        job_skills_response = llm.invoke(job_skills_prompt.format(job_description=job_description))
        job_skills_text = job_skills_response.content.strip()
        
        # Clean and parse job skills
        try:
            # Remove any markdown formatting
            job_skills_text = job_skills_text.replace('```json', '').replace('```', '').strip()
            job_skills = json.loads(job_skills_text)
            if not isinstance(job_skills, list):
                job_skills = []
        except json.JSONDecodeError:
            # Fallback: extract using regex
            job_skills = extract_skills_from_text(job_description)
        
        # Step 2: Extract skills from resume
        resume_skills_prompt = """
        Extract all technical skills, programming languages, frameworks, tools, and technologies mentioned in the resume.
        
        Resume Content: {resume_content}
        
        Return ONLY a JSON array of skill names, like this:
        ["Python", "JavaScript", "React", "Git"]
        
        Focus on:
        - Programming languages (Python, JavaScript, Java, etc.)
        - Frameworks (React, Angular, Django, Flask, etc.)
        - Databases (MySQL, MongoDB, PostgreSQL, etc.)
        - Cloud platforms (AWS, Azure, GCP, etc.)
        - Tools (Docker, Kubernetes, Git, Jenkins, etc.)
        - Methodologies (Agile, Scrum, DevOps, etc.)
        
        Only return the JSON array, no other text.
        """
        
        resume_skills_response = llm.invoke(resume_skills_prompt.format(resume_content=resume_text[:3000]))
        resume_skills_text = resume_skills_response.content.strip()
        
        # Clean and parse resume skills
        try:
            # Remove any markdown formatting
            resume_skills_text = resume_skills_text.replace('```json', '').replace('```', '').strip()
            resume_skills = json.loads(resume_skills_text)
            if not isinstance(resume_skills, list):
                resume_skills = []
        except json.JSONDecodeError:
            # Fallback: extract using regex
            resume_skills = extract_skills_from_text(resume_text)
        
        # Step 3: Compare skills and identify gaps
        # Normalize skill names for comparison
        job_skills_normalized = [skill.lower().strip() for skill in job_skills]
        resume_skills_normalized = [skill.lower().strip() for skill in resume_skills]
        
        # Find present and missing skills
        present_skills = []
        missing_skills = []
        
        for skill in job_skills:
            skill_lower = skill.lower().strip()
            if skill_lower in resume_skills_normalized:
                present_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        # Find additional skills in resume
        additional_skills = []
        for skill in resume_skills:
            skill_lower = skill.lower().strip()
            if skill_lower not in job_skills_normalized:
                additional_skills.append(skill)
        
        # Step 4: Create detailed skill analysis
        skill_analysis = {}
        
        # Analyze present skills
        for skill in present_skills:
            skill_analysis[skill] = {
                "status": "present",
                "importance": "high" if skill.lower() in ["python", "javascript", "react", "java", "aws", "docker"] else "medium",
                "level": "intermediate"  # Default level
            }
        
        # Analyze missing skills
        for skill in missing_skills:
            skill_analysis[skill] = {
                "status": "missing",
                "importance": "high" if skill.lower() in ["python", "javascript", "react", "java", "aws", "docker"] else "medium",
                "level": "basic"  # Default level for missing skills
            }
        
        # Analyze additional skills
        for skill in additional_skills:
            skill_analysis[skill] = {
                "status": "additional",
                "importance": "medium",
                "level": "intermediate"
            }
        
        return {
            "present_skills": present_skills,
            "missing_skills": missing_skills,
            "additional_skills": additional_skills,
            "skill_analysis": skill_analysis
        }
        
    except Exception as e:
        print(f"Error in skill gap analysis: {e}")
        # Fallback to regex-based extraction
        return extract_skills_fallback_improved(resume_text, job_description)

def extract_skills_from_text(text):
    """Extract skills from text using regex patterns."""
    # Comprehensive list of technical skills
    skills_patterns = {
        # Programming Languages
        "python": r"\bpython\b",
        "javascript": r"\b(?:javascript|js)\b",
        "java": r"\bjava\b",
        "typescript": r"\btypescript\b",
        "c++": r"\bc\+\+\b",
        "c#": r"\bc#\b",
        "php": r"\bphp\b",
        "go": r"\bgo\b",
        "rust": r"\brust\b",
        "swift": r"\bswift\b",
        "kotlin": r"\bkotlin\b",
        "scala": r"\bscala\b",
        "ruby": r"\bruby\b",
        "perl": r"\bperl\b",
        "r": r"\br\b",
        "matlab": r"\bmatlab\b",
        
        # Frameworks and Libraries
        "react": r"\breact\b",
        "angular": r"\bangular\b",
        "vue": r"\bvue\b",
        "node.js": r"\b(?:node\.js|nodejs)\b",
        "express": r"\bexpress\b",
        "django": r"\bdjango\b",
        "flask": r"\bflask\b",
        "spring": r"\bspring\b",
        "laravel": r"\blaravel\b",
        "asp.net": r"\basp\.net\b",
        "jquery": r"\bjquery\b",
        "bootstrap": r"\bbootstrap\b",
        "tailwind": r"\btailwind\b",
        "sass": r"\bsass\b",
        "less": r"\bless\b",
        
        # Databases
        "mysql": r"\bmysql\b",
        "postgresql": r"\b(?:postgresql|postgres)\b",
        "mongodb": r"\bmongodb\b",
        "redis": r"\bredis\b",
        "sqlite": r"\bsqlite\b",
        "oracle": r"\boracle\b",
        "sql server": r"\bsql server\b",
        "cassandra": r"\bcassandra\b",
        "dynamodb": r"\bdynamodb\b",
        
        # Cloud Platforms
        "aws": r"\b(?:aws|amazon web services)\b",
        "azure": r"\b(?:azure|microsoft azure)\b",
        "gcp": r"\b(?:gcp|google cloud|google cloud platform)\b",
        "heroku": r"\bheroku\b",
        "digitalocean": r"\bdigitalocean\b",
        
        # DevOps and Tools
        "docker": r"\bdocker\b",
        "kubernetes": r"\b(?:kubernetes|k8s)\b",
        "jenkins": r"\bjenkins\b",
        "git": r"\bgit\b",
        "github": r"\bgithub\b",
        "gitlab": r"\bgitlab\b",
        "bitbucket": r"\bbitbucket\b",
        "terraform": r"\bterraform\b",
        "ansible": r"\bansible\b",
        "chef": r"\bchef\b",
        "puppet": r"\bpuppet\b",
        
        # Web Technologies
        "html": r"\bhtml\b",
        "css": r"\bcss\b",
        "http": r"\bhttp\b",
        "rest": r"\brest\b",
        "graphql": r"\bgraphql\b",
        "soap": r"\bsoap\b",
        "websocket": r"\bwebsocket\b",
        
        # Methodologies
        "agile": r"\bagile\b",
        "scrum": r"\bscrum\b",
        "kanban": r"\bkanban\b",
        "devops": r"\bdevops\b",
        "ci/cd": r"\b(?:ci/cd|continuous integration|continuous deployment)\b",
        "tdd": r"\b(?:tdd|test driven development)\b",
        "bdd": r"\b(?:bdd|behavior driven development)\b",
        
        # AI and ML
        "machine learning": r"\b(?:machine learning|ml)\b",
        "deep learning": r"\bdeep learning\b",
        "ai": r"\b(?:ai|artificial intelligence)\b",
        "tensorflow": r"\btensorflow\b",
        "pytorch": r"\bpytorch\b",
        "scikit-learn": r"\b(?:scikit-learn|sklearn)\b",
        "pandas": r"\bpandas\b",
        "numpy": r"\bnumpy\b",
        "matplotlib": r"\bmatplotlib\b",
        "seaborn": r"\bseaborn\b",
        
        # Other Technologies
        "linux": r"\blinux\b",
        "unix": r"\bunix\b",
        "windows": r"\bwindows\b",
        "macos": r"\b(?:macos|mac os)\b",
        "android": r"\bandroid\b",
        "ios": r"\bios\b",
        "firebase": r"\bfirebase\b",
        "elasticsearch": r"\belasticsearch\b",
        "kafka": r"\bkafka\b",
        "rabbitmq": r"\brabbitmq\b",
        "nginx": r"\bnginx\b",
        "apache": r"\bapache\b"
    }
    
    found_skills = []
    text_lower = text.lower()
    
    for skill_name, pattern in skills_patterns.items():
        if re.search(pattern, text_lower):
            found_skills.append(skill_name.title())
    
    return found_skills

def extract_skills_fallback_improved(resume_text, job_description):
    """Improved fallback method to extract skills using regex patterns."""
    # Extract skills from both texts
    job_skills = extract_skills_from_text(job_description)
    resume_skills = extract_skills_from_text(resume_text)
    
    # Normalize for comparison
    job_skills_normalized = [skill.lower().strip() for skill in job_skills]
    resume_skills_normalized = [skill.lower().strip() for skill in resume_skills]
    
    # Find present and missing skills
    present_skills = []
    missing_skills = []
    
    for skill in job_skills:
        skill_lower = skill.lower().strip()
        if skill_lower in resume_skills_normalized:
            present_skills.append(skill)
        else:
            missing_skills.append(skill)
    
    # Find additional skills in resume
    additional_skills = []
    for skill in resume_skills:
        skill_lower = skill.lower().strip()
        if skill_lower not in job_skills_normalized:
            additional_skills.append(skill)
    
    # Create skill analysis
    skill_analysis = {}
    
    for skill in present_skills:
        skill_analysis[skill] = {
            "status": "present",
            "importance": "high" if skill.lower() in ["python", "javascript", "react", "java", "aws", "docker"] else "medium",
            "level": "intermediate"
        }
    
    for skill in missing_skills:
        skill_analysis[skill] = {
            "status": "missing",
            "importance": "high" if skill.lower() in ["python", "javascript", "react", "java", "aws", "docker"] else "medium",
            "level": "basic"
        }
    
    for skill in additional_skills:
        skill_analysis[skill] = {
            "status": "additional",
            "importance": "medium",
            "level": "intermediate"
        }
    
    return {
        "present_skills": present_skills,
        "missing_skills": missing_skills,
        "additional_skills": additional_skills,
        "skill_analysis": skill_analysis
    }

def extract_skills_fallback(response_text, job_description):
    """Legacy fallback method - kept for backward compatibility."""
    return extract_skills_fallback_improved(response_text, job_description)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'mode': 'stateless',
        'description': 'API processes data for recommendations without storing user data',
        'port': os.environ.get("PORT", FLASK_PORT),
        'allowed_origins': '*' if ALLOW_ALL_ORIGINS else ALLOWED_ORIGINS,
        'gemini_configured': bool(GEMINI_API_KEY),
        'youtube_configured': bool(YOUTUBE_API_KEY)
    })

@app.route('/skill-gap-analysis', methods=['POST'])
def skill_gap_analysis():
    """API endpoint for skill gap analysis (Stateless - No Data Storage)."""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400
        
        # Get job description from form data
        job_description = request.form.get('job_description', '')
        if not job_description.strip():
            return jsonify({'error': 'Job description is required'}), 400
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Extract text from resume (temporary processing only - no storage)
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)
            
            # Console logging for skill gap analysis
            print("\n" + "="*60)
            print("🔍 SKILL GAP ANALYSIS")
            print("="*60)
            print(f"📁 Resume file: {file.filename}")
            print(f"📊 Resume size: {len(resume_text)} characters")
            print(f"📋 Job description size: {len(job_description)} characters")
            print(f"📝 Job description preview:")
            print("-" * 40)
            print(job_description[:300] + "..." if len(job_description) > 300 else job_description)
            print("-" * 40)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400
            
            # Analyze skill gap using the SkillGapAnalyzer (stateless processing - no data stored)
            analyzer = get_skill_analyzer()
            skill_analysis_result = analyzer.analyze_skill_gap_with_resources(resume_text, job_description)
            
            skill_analysis = skill_analysis_result['analysis']
            learning_resources = skill_analysis_result['learning_resources']
            
            # Console logging for skill gap results
            print("\n" + "📊 SKILL GAP ANALYSIS RESULTS")
            print("="*60)
            print(f"✅ Present skills: {len(skill_analysis.get('present_skills', []))}")
            print(f"❌ Missing skills: {len(skill_analysis.get('missing_skills', []))}")
            print(f"➕ Additional skills: {len(skill_analysis.get('additional_skills', []))}")
            
            if skill_analysis.get('present_skills'):
                print(f"🎯 Present: {', '.join(skill_analysis['present_skills'][:10])}")
            if skill_analysis.get('missing_skills'):
                print(f"🔍 Missing: {', '.join(skill_analysis['missing_skills'][:10])}")
            if skill_analysis.get('additional_skills'):
                print(f"💡 Additional: {', '.join(skill_analysis['additional_skills'][:10])}")
            
            completion_percentage = round(
                len(skill_analysis.get('present_skills', [])) / 
                max(1, len(skill_analysis.get('present_skills', [])) + len(skill_analysis.get('missing_skills', []))) * 100, 2
            )
            print(f"📈 Skill match percentage: {completion_percentage}%")
            print("="*60)
            
            # Prepare response
            response_data = {
                'success': True,
                'message': 'Skill gap analysis completed successfully!',
                'analysis': {
                    'present_skills': skill_analysis.get('present_skills', []),
                    'missing_skills': skill_analysis.get('missing_skills', []),
                    'additional_skills': skill_analysis.get('additional_skills', []),
                    'skill_analysis': skill_analysis.get('skill_analysis', {}),
                    'summary': {
                        'total_skills_required': len(skill_analysis.get('present_skills', [])) + len(skill_analysis.get('missing_skills', [])),
                        'skills_present': len(skill_analysis.get('present_skills', [])),
                        'skills_missing': len(skill_analysis.get('missing_skills', [])),
                        'completion_percentage': round(
                            len(skill_analysis.get('present_skills', [])) / 
                            max(1, len(skill_analysis.get('present_skills', [])) + len(skill_analysis.get('missing_skills', []))) * 100, 2
                        )
                    }
                },
                'learning_resources': learning_resources,
                'resume_text_preview': resume_text[:500] + '...' if len(resume_text) > 500 else resume_text
            }
            
            return jsonify(response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"Error in skill gap analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'An error occurred during skill gap analysis: {str(e)}'}), 500

@app.route('/upload-resume', methods=['POST'])
def upload_resume_and_recommend():
    """API endpoint for resume upload and job recommendations (Stateless - No Data Storage)."""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400
        
        # Get optional parameters
        location = request.form.get('location', '')
        top_k = int(request.form.get('top_k', 15))  # Increased default to get more jobs
        provider = request.form.get('provider', 'all')  # linkedin, indeed, all
        only_provider = request.form.get('only_provider', 'false').lower() == 'true'
        
        # Debug parameter values
        print(f"\n📋 REQUEST PARAMETERS")
        print(f"Location: '{location}'")
        print(f"Top K: {top_k}")
        print(f"Provider: '{provider}'")
        print(f"Only Provider: {only_provider}")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Extract text from resume (temporary processing only - no storage)
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)
            
            # Console logging for resume parsing
            print("\n" + "="*60)
            print("📄 RESUME PARSING RESULTS")
            print("="*60)
            print(f"📁 File: {file.filename}")
            print(f"📊 File size: {len(resume_text)} characters")
            print(f"📝 Resume content preview:")
            print("-" * 40)
            print(resume_text[:500] + "..." if len(resume_text) > 500 else resume_text)
            print("-" * 40)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400
            
            # Get job recommendations (stateless processing - no user data stored)
            # Use relaxed location filtering to get more jobs
            recommender = get_job_recommender()
            recommendations = recommender.recommend_jobs(
                resume_text=resume_text,
                location_filter=None,  # Remove strict location filtering to get more jobs
                top_k=top_k * 2  # Get more jobs initially, then filter/sort
            )
            
            if not recommendations['success']:
                return jsonify({'error': recommendations.get('error', 'Failed to generate recommendations')}), 500
            
            # Skip provider filtering - client will handle URL selection
            print(f"\n🔍 PROVIDER FILTERING DEBUG")
            print(f"Provider: '{provider}', Only provider: {only_provider}")
            print(f"Jobs before filtering: {len(recommendations['top_jobs'])}")
            print("Skipping provider filtering - client will handle URL selection properly")
            
            # Debug: Show URL fields for first few jobs
            for i, job in enumerate(recommendations['top_jobs'][:3]):
                print(f"  Job {i+1}: {job.get('title', 'No title')}")
                print(f"    job_url: {job.get('job_url', 'None')}")
                print(f"    apply_url: {job.get('apply_url', 'None')}")
                print(f"    apply_link: {job.get('apply_link', 'None')}")
            
            # Post-process jobs: sort by similarity and add LinkedIn URLs
            print(f"\n🔄 POST-PROCESSING JOBS")
            processed_jobs = []
            
            for job in recommendations['top_jobs']:
                # Get apply URLs from the dataset
                apply_url = job.get('apply_url', '') or job.get('applyUrl', '') or job.get('apply_link', '')
                job_url = job.get('job_url', '') or job.get('jobUrl', '')
                
                # Determine if it's a LinkedIn job
                is_linkedin = 'linkedin.com' in (job_url or apply_url)
                
                # Create enhanced job object
                enhanced_job = {
                    **job,  # Keep all original fields
                    'linkedin_url': job_url if is_linkedin else '',
                    'apply_url': apply_url,  # Direct apply URL from dataset
                    'job_url': job_url,  # LinkedIn job page URL
                    'source': 'LinkedIn' if is_linkedin else 'Other'
                }
                processed_jobs.append(enhanced_job)
            
            # Sort by similarity score (highest first)
            processed_jobs.sort(key=lambda x: x.get('similarity', 0), reverse=True)
            
            # Take only the requested number of top jobs
            final_jobs = processed_jobs[:top_k]
            
            print(f"📊 Jobs after post-processing: {len(final_jobs)}")
            print(f"🔗 LinkedIn jobs: {len([j for j in final_jobs if j.get('linkedin_url')])}")
            
            # Update recommendations with processed jobs
            recommendations['top_jobs'] = final_jobs
            
            # Console logging for API response
            print("\n" + "📤 API RESPONSE PREPARATION")
            print("="*60)
            print(f"✅ Jobs to return: {len(recommendations['top_jobs'])}")
            print(f"📋 Response keys: top_jobs, jobs, resume_analysis")
            print(f"🔍 Sample job data:")
            if recommendations['top_jobs']:
                sample_job = recommendations['top_jobs'][0]
                print(f"   Title: {sample_job.get('title', 'N/A')}")
                print(f"   Company: {sample_job.get('company', 'N/A')}")
                print(f"   Similarity: {sample_job.get('similarity', 'N/A')}%")
            print("="*60)
            
            # Prepare response with multiple key formats for frontend compatibility
            response_data = {
                'success': True,
                'message': f'Found {len(recommendations["top_jobs"])} job recommendations!',
                'top_jobs': recommendations['top_jobs'],  # Original key
                'jobs': recommendations['top_jobs'],      # Alternative key for frontend
                'data': recommendations['top_jobs'],      # Another alternative
                'recommendations': recommendations['top_jobs'],  # Yet another alternative
                'resume_analysis': recommendations['resume_analysis'],
                'total_jobs_analyzed': recommendations['total_jobs_analyzed'],
                'query': recommendations.get('query', ''),
                'timestamp': recommendations.get('timestamp', ''),
                'filters_applied': {
                    'location': location,
                    'provider': provider,
                    'only_provider': only_provider
                }
            }
            
            # Create response with explicit CORS headers for upload-resume
            response = jsonify(response_data)
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            
            print(f"📤 Final upload-resume response sent with {len(recommendations['top_jobs'])} jobs")
            return response
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"Error in job recommendation: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'An error occurred during job recommendation: {str(e)}'}), 500

# Commented out - job scraping not needed for stateless mode
# @app.route('/scrape-jobs', methods=['POST'])
# def scrape_jobs():
#     """API endpoint to trigger job scraping"""
#     try:
#         # Get parameters
#         keywords = request.json.get('keywords', [])
#         locations = request.json.get('locations', [])
#         max_jobs_per_source = request.json.get('max_jobs_per_source', 50)
#         
#         # Run scraping
#         results = job_scraper.scrape_all_jobs(
#             keywords=keywords if keywords else None,
#             locations=locations if locations else None,
#             max_jobs_per_source=max_jobs_per_source
#         )
#         
#         return jsonify(results)
#         
#     except Exception as e:
#         print(f"Error in job scraping: {str(e)}")
#         print(traceback.format_exc())
#         return jsonify({'error': f'An error occurred during job scraping: {str(e)}'}), 500

@app.route('/recommend-jobs', methods=['POST'])
def recommend_jobs_enhanced():
    """Enhanced API endpoint for job recommendations with better matching"""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400
        
        # Get optional parameters
        location = request.form.get('location', '')
        top_k = int(request.form.get('top_k', 15))  # Increased default for more jobs
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Extract text from resume (temporary processing only - no storage)
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)
            
            # Console logging for enhanced endpoint
            print("\n" + "="*60)
            print("🚀 ENHANCED RESUME PROCESSING")
            print("="*60)
            print(f"📁 File: {file.filename}")
            print(f"📊 File size: {len(resume_text)} characters")
            print(f"🎯 Requested recommendations: {top_k}")
            print(f"📍 Location filter: {location if location else 'None (relaxed filtering)'}")
            print("-" * 40)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400
            
            # Get job recommendations with relaxed filtering
            recommender = get_job_recommender()
            recommendations = recommender.recommend_jobs(
                resume_text=resume_text,
                location_filter=None,  # Remove location filter for more results
                top_k=top_k
            )
            
            if not recommendations['success']:
                return jsonify({'error': recommendations.get('error', 'Failed to generate recommendations')}), 500
            
            # Prepare enhanced response
            response_data = {
                'success': True,
                'message': f'Found {len(recommendations["top_jobs"])} job recommendations!',
                'jobs': recommendations['top_jobs'],  # Use 'jobs' key for frontend compatibility
                'top_jobs': recommendations['top_jobs'],  # Keep both for compatibility
                'resume_analysis': recommendations['resume_analysis'],
                'total_jobs_analyzed': recommendations['total_jobs_analyzed'],
                'query': recommendations.get('query', ''),
                'timestamp': recommendations.get('timestamp', ''),
                'filters_applied': {
                    'location': location,
                    'top_k': top_k
                }
            }
            
            return jsonify(response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"Error in enhanced job recommendation: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'An error occurred during job recommendation: {str(e)}'}), 500

@app.route('/jobs-stats', methods=['GET'])
def get_jobs_stats():
    """Get statistics about available jobs"""
    try:
        jobs_data = job_recommender.jobs_data
        
        if not jobs_data:
            return jsonify({
                'success': True,
                'total_jobs': 0,
                'stats': {}
            })
        
        # Calculate statistics
        total_jobs = len(jobs_data)
        
        # Count by company
        companies = {}
        locations = {}
        sectors = {}
        experience_levels = {}
        
        for job in jobs_data:
            # Companies
            company = job.get('company', 'Unknown')
            companies[company] = companies.get(company, 0) + 1
            
            # Locations
            location = job.get('location', 'Unknown')
            locations[location] = locations.get(location, 0) + 1
            
            # Sectors
            sector = job.get('sector', 'Unknown')
            sectors[sector] = sectors.get(sector, 0) + 1
            
            # Experience levels
            exp_level = job.get('experience_level', 'Unknown')
            experience_levels[exp_level] = experience_levels.get(exp_level, 0) + 1
        
        # Get top 10 for each category
        top_companies = sorted(companies.items(), key=lambda x: x[1], reverse=True)[:10]
        top_locations = sorted(locations.items(), key=lambda x: x[1], reverse=True)[:10]
        top_sectors = sorted(sectors.items(), key=lambda x: x[1], reverse=True)[:10]
        
        stats = {
            'total_jobs': total_jobs,
            'top_companies': top_companies,
            'top_locations': top_locations,
            'top_sectors': top_sectors,
            'experience_levels': dict(experience_levels),
            'last_updated': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        print(f"Error getting jobs stats: {str(e)}")
        return jsonify({'error': f'An error occurred getting job statistics: {str(e)}'}), 500

@app.route('/all-jobs', methods=['GET'])
def get_all_jobs():
    """Get all available jobs (for testing and frontend display)"""
    try:
        jobs_data = job_recommender.jobs_data
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Calculate pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Format jobs for frontend
        formatted_jobs = []
        seen_job_ids = set()  # Track unique job IDs to prevent duplicates
        
        for i, job in enumerate(jobs_data[start_idx:end_idx], start_idx):
            job_id = job.get('id', str(i))
            
            # Skip duplicate jobs based on job ID
            if job_id in seen_job_ids:
                continue
            seen_job_ids.add(job_id)
            
            # Ensure we use the exact URLs from data.json
            job_url = job.get('jobUrl', '')
            apply_url = job.get('applyUrl', '')
            primary_apply_link = apply_url if apply_url else job_url
            
            formatted_job = {
                'id': job_id,
                'title': job.get('title', 'No Title'),
                'company': job.get('companyName', job.get('company', 'Unknown Company')),
                'location': job.get('location', 'Unknown Location'),
                'description': job.get('description', '')[:300] + '...' if len(job.get('description', '')) > 300 else job.get('description', ''),
                'similarity': 85,  # Default similarity for display
                'skills_required': job.get('skills', [])[:5],
                'skills_matched': [],
                'skills_missing': [],
                'experience_level': job.get('experienceLevel', ''),
                'contract_type': job.get('contractType', ''),
                'work_type': job.get('workType', ''),
                'sector': job.get('sector', ''),
                'apply_link': primary_apply_link,  # Use exact URL from data.json
                'apply_url': apply_url,
                'job_url': job_url,
                'linkedin_url': job_url if 'linkedin.com' in job_url else '',
                'posted_time': job.get('postedTime', ''),
                'applications_count': job.get('applicationsCount', ''),
                'company_url': job.get('companyUrl', ''),
                'salary': job.get('salary', ''),
                'source': 'LinkedIn' if 'linkedin.com' in job_url else 'Other'
            }
            formatted_jobs.append(formatted_job)
        
        return jsonify({
            'success': True,
            'jobs': formatted_jobs,
            'total_jobs': len(jobs_data),
            'page': page,
            'per_page': per_page,
            'total_pages': (len(jobs_data) + per_page - 1) // per_page,
            'message': f'Retrieved {len(formatted_jobs)} jobs'
        })
        
    except Exception as e:
        print(f"Error getting all jobs: {str(e)}")
        return jsonify({'error': f'An error occurred getting jobs: {str(e)}'}), 500

def generate_learning_recommendations(missing_skills):
    """Generate learning recommendations for missing skills."""
    recommendations = []
    
    # Define skill categories with specific recommendations
    skill_categories = {
        # Programming Languages
        'python': {
            'type': 'programming_language',
            'resources': [
                'Complete Python for Beginners course on Coursera or Udemy',
                'Build 2-3 projects: web app, data analysis, automation script',
                'Practice on LeetCode, HackerRank, or Codewars',
                'Join Python Discord, Reddit r/learnpython, or local Python meetups',
                'Read "Python Crash Course" or "Automate the Boring Stuff"'
            ],
            'estimated_time': '2-3 months',
            'priority': 'high'
        },
        'javascript': {
            'type': 'programming_language',
            'resources': [
                'Complete JavaScript fundamentals on freeCodeCamp or MDN',
                'Build interactive web applications and browser games',
                'Practice on JavaScript30 or Frontend Mentor challenges',
                'Join JavaScript communities on Discord or Reddit',
                'Read "Eloquent JavaScript" or "You Don\'t Know JS"'
            ],
            'estimated_time': '2-4 months',
            'priority': 'high'
        },
        'java': {
            'type': 'programming_language',
            'resources': [
                'Complete Java Programming course on Coursera',
                'Build desktop applications and Android apps',
                'Practice on HackerRank Java challenges',
                'Join Java user groups and Stack Overflow',
                'Read "Head First Java" or "Effective Java"'
            ],
            'estimated_time': '3-4 months',
            'priority': 'high'
        },
        
        # Frontend Frameworks
        'react': {
            'type': 'frontend_framework',
            'resources': [
                'Complete React course on Scrimba or Udemy',
                'Build portfolio website and e-commerce app',
                'Practice with React challenges on Frontend Mentor',
                'Join React communities and follow React blog',
                'Read "React Up & Running" or official React docs'
            ],
            'estimated_time': '2-3 months',
            'priority': 'high'
        },
        'angular': {
            'type': 'frontend_framework',
            'resources': [
                'Complete Angular course on Angular University',
                'Build enterprise-level applications',
                'Practice with Angular Material and RxJS',
                'Join Angular Discord and follow Angular blog',
                'Read "Angular in Action" or official Angular docs'
            ],
            'estimated_time': '3-4 months',
            'priority': 'medium'
        },
        'vue': {
            'type': 'frontend_framework',
            'resources': [
                'Complete Vue.js course on Vue Mastery',
                'Build single-page applications',
                'Practice with Vue challenges and Nuxt.js',
                'Join Vue.js communities and Discord',
                'Read "Vue.js in Action" or official Vue docs'
            ],
            'estimated_time': '2-3 months',
            'priority': 'medium'
        },
        
        # Backend Technologies
        'node.js': {
            'type': 'backend_framework',
            'resources': [
                'Complete Node.js course on freeCodeCamp',
                'Build REST APIs and real-time applications',
                'Practice with Express.js and MongoDB',
                'Join Node.js communities and Discord',
                'Read "Node.js in Action" or official Node.js docs'
            ],
            'estimated_time': '2-3 months',
            'priority': 'high'
        },
        'express': {
            'type': 'backend_framework',
            'resources': [
                'Learn Express.js fundamentals and middleware',
                'Build RESTful APIs and authentication systems',
                'Practice with Express.js tutorials and projects',
                'Join Express.js communities and Stack Overflow',
                'Read "Express in Action" or official Express docs'
            ],
            'estimated_time': '1-2 months',
            'priority': 'medium'
        },
        
        # Databases
        'mongodb': {
            'type': 'database',
            'resources': [
                'Complete MongoDB University free courses',
                'Practice database design and CRUD operations',
                'Build applications with MongoDB and Mongoose',
                'Join MongoDB communities and forums',
                'Read "MongoDB in Action" or official MongoDB docs'
            ],
            'estimated_time': '1-2 months',
            'priority': 'medium'
        },
        'mysql': {
            'type': 'database',
            'resources': [
                'Complete MySQL course on Coursera or Udemy',
                'Practice SQL queries and database design',
                'Build applications with MySQL and Node.js/Python',
                'Join MySQL communities and Stack Overflow',
                'Read "MySQL Cookbook" or official MySQL docs'
            ],
            'estimated_time': '1-2 months',
            'priority': 'medium'
        },
        
        # Cloud Platforms
        'aws': {
            'type': 'cloud_platform',
            'resources': [
                'Get AWS Certified Cloud Practitioner certification',
                'Practice with AWS free tier and hands-on labs',
                'Deploy applications on AWS services (EC2, S3, Lambda)',
                'Join AWS communities and attend AWS events',
                'Read "AWS Certified Solutions Architect" study guide'
            ],
            'estimated_time': '3-6 months',
            'priority': 'high'
        },
        'docker': {
            'type': 'devops_tool',
            'resources': [
                'Complete Docker course on Docker Academy',
                'Containerize applications and create Dockerfiles',
                'Practice with Docker Compose and multi-container apps',
                'Join Docker communities and Discord',
                'Read "Docker in Action" or official Docker docs'
            ],
            'estimated_time': '1-2 months',
            'priority': 'high'
        },
        'kubernetes': {
            'type': 'devops_tool',
            'resources': [
                'Complete Kubernetes course on Linux Academy',
                'Practice with minikube and kubectl commands',
                'Deploy applications on Kubernetes clusters',
                'Join Kubernetes communities and attend KubeCon',
                'Read "Kubernetes in Action" or official K8s docs'
            ],
            'estimated_time': '2-4 months',
            'priority': 'medium'
        },
        
        # Methodologies
        'agile': {
            'type': 'methodology',
            'resources': [
                'Take Agile/Scrum certification course',
                'Practice Agile methodologies in team projects',
                'Use Agile tools like Jira, Trello, or Asana',
                'Join Agile communities and attend meetups',
                'Read "Scrum: The Art of Doing Twice the Work"'
            ],
            'estimated_time': '1-2 months',
            'priority': 'medium'
        },
        'devops': {
            'type': 'methodology',
            'resources': [
                'Complete DevOps course on Linux Academy or A Cloud Guru',
                'Practice CI/CD pipelines with Jenkins or GitHub Actions',
                'Learn infrastructure as code with Terraform',
                'Join DevOps communities and attend DevOps Days',
                'Read "The Phoenix Project" or "DevOps Handbook"'
            ],
            'estimated_time': '3-6 months',
            'priority': 'high'
        }
    }
    
    for skill in missing_skills:
        skill_lower = skill.lower()
        
        # Find matching category
        matched_category = None
        for category_key, category_data in skill_categories.items():
            if category_key in skill_lower or skill_lower in category_key:
                matched_category = category_data
                break
        
        if matched_category:
            recommendations.append({
                'skill': skill,
                'type': matched_category['type'],
                'resources': matched_category['resources'],
                'estimated_time': matched_category['estimated_time'],
                'priority': matched_category['priority']
            })
        else:
            # Generic recommendation for unmatched skills
            recommendations.append({
                'skill': skill,
                'type': 'general',
                'resources': [
                    f'Research {skill} fundamentals and best practices',
                    f'Find online courses for {skill} on Coursera, Udemy, or edX',
                    f'Practice {skill} in real-world projects',
                    f'Join {skill} communities and professional networks',
                    f'Follow {skill} experts on LinkedIn and Twitter'
                ],
                'estimated_time': '2-4 months',
                'priority': 'medium'
            })
    
    return recommendations

if __name__ == '__main__':
    port = int(os.environ.get("PORT", FLASK_PORT))
    
    # Configure Werkzeug to exclude venv directory from file watching
    # This prevents infinite reload loops when packages are loaded
    import sys
    from werkzeug.serving import run_simple
    
    # Disable reloader for venv directory
    os.environ['WERKZEUG_RUN_MAIN'] = os.environ.get('WERKZEUG_RUN_MAIN', 'false')
    
    print("\n" + "="*60)
    print("🚀 Starting Flask Server")
    print("="*60)
    print(f"📡 Port: {port}")
    print(f"🔧 Debug Mode: True")
    print(f"⚠️  File watcher: Excluding venv directory")
    print("="*60 + "\n")
    
    # Run with custom configuration to exclude venv
    app.run(
        host="0.0.0.0", 
        port=port, 
        debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true",
        use_reloader=False,
        extra_files=[]
    )
    
