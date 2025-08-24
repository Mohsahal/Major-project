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

# Remove global imports of LangChain components
# from langchain_community.vectorstores import FAISS
# from langchain.chains import RetrievalQA
# from langchain.prompts import PromptTemplate
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
# from langchain_text_splitters import CharacterTextSplitter

import dotenv
from googleapiclient.discovery import build  # For YouTube API

# Import job recommender functions
from job_recommender import (
    analyze_resume_type, 
    generate_smart_query, 
    fetch_jobs_from_serpapi,
    rank_jobs_domain_aware,
    save_to_csv
)

# Import configuration
from config import SERPAPI_API_KEY, GEMINI_API_KEY, YOUTUBE_API_KEY, DEFAULT_LOCATION, DEFAULT_TOP_RESULTS, DEFAULT_MODEL, FLASK_PORT

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["https://frontend-uzcu.onrender.com"]}})


# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# Load environment variables for skill gap analysis
dotenv.load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Global variables for lazy loading
_langchain_components = None
_youtube_client = None

def get_langchain_components():
    """Lazy load LangChain components only when needed."""
    global _langchain_components
    
    if _langchain_components is None:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain.prompts import PromptTemplate
            
            _langchain_components = {
                'ChatGoogleGenerativeAI': ChatGoogleGenerativeAI,
                'PromptTemplate': PromptTemplate
            }
            print("LangChain components loaded successfully")
        except ImportError as e:
            print(f"Error importing LangChain components: {e}")
            raise ImportError("LangChain components not installed. Please install with: pip install langchain langchain-google-genai")
        except Exception as e:
            print(f"Error loading LangChain components: {e}")
            raise
    
    return _langchain_components

def get_youtube_client():
    """Lazy load YouTube client only when needed."""
    global _youtube_client
    
    if _youtube_client is None and YOUTUBE_API_KEY:
        try:
            _youtube_client = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
            print("YouTube API client loaded successfully")
        except Exception as e:
            print(f"Failed to initialize YouTube API client: {e}")
            _youtube_client = None
    
    return _youtube_client

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

def get_youtube_videos(skill, max_results=3):
    """Get YouTube video suggestions for a skill."""
    youtube_client = get_youtube_client()
    if not youtube_client:
        return []
    
    try:
        request = youtube_client.search().list(
            q=f"{skill} tutorial programming",
            part="snippet",
            type="video",
            maxResults=max_results,
            order="relevance"
        )
        response = request.execute()
        videos = []
        for item in response.get('items', []):
            video_id = item['id'].get('videoId')
            if video_id:
                videos.append({
                    'title': item['snippet']['title'],
                    'channel': item['snippet']['channelTitle'],
                    'videoId': video_id,
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                    'description': item['snippet']['description'][:150] + '...' if len(item['snippet']['description']) > 150 else item['snippet']['description']
                })
        return videos
    except Exception as e:
        print(f"Error fetching YouTube videos for {skill}: {e}")
        return []

def analyze_skill_gap(resume_text, job_description):
    """Analyze skill gap between resume and job description."""
    try:
        if not GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY not configured")
        
        # Load LangChain components only when needed
        components = get_langchain_components()
        ChatGoogleGenerativeAI = components['ChatGoogleGenerativeAI']
        PromptTemplate = components['PromptTemplate']
        
        # First, extract skills from both resume and job description using a more direct approach
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
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
    """Health check route"""
    return jsonify({
        'status': 'ok',
        'port': os.environ.get("PORT", FLASK_PORT),
        'allowed_origins': "https://frontend-uzcu.onrender.com",
        'gemini_configured': bool(GEMINI_API_KEY),
        'youtube_configured': bool(YOUTUBE_API_KEY),
        'serpapi_configured': bool(SERPAPI_API_KEY)
    })

@app.route('/skill-gap-analysis', methods=['POST'])
def skill_gap_analysis():
    """API endpoint for skill gap analysis."""
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
            # Extract text from resume
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400
            
            # Analyze skill gap
            skill_analysis = analyze_skill_gap(resume_text, job_description)
            
            # Get YouTube videos for missing skills
            missing_skills_videos = {}
            if skill_analysis.get('missing_skills'):
                for skill in skill_analysis['missing_skills'][:5]:  # Limit to 5 skills
                    videos = get_youtube_videos(skill)
                    if videos:
                        missing_skills_videos[skill] = videos
            
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
                'learning_resources': {
                    'youtube_videos': missing_skills_videos,
                    'recommendations': generate_learning_recommendations(skill_analysis.get('missing_skills', []))
                },
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
        
        # Get preferences
        location = request.form.get('location', DEFAULT_LOCATION)
        preferred_provider = request.form.get('provider', '').lower()  # e.g., 'linkedin'
        only_provider = request.form.get('only_provider', 'false').lower() == 'true'
        
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
            
            # Optionally filter by provider (e.g., linkedin)
            if preferred_provider and only_provider:
                def best_provider(j):
                    _, provider = best_apply_link(j, preferred_provider)
                    return provider == preferred_provider
                ranked_jobs = list(filter(best_provider, ranked_jobs))

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
                'top_jobs': format_jobs_for_response(top_jobs, preferred_provider=preferred_provider),
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

def extract_apply_options(job):
    opts = []
    # SerpApi provides apply_options with 'link' and 'source'
    for opt in (job.get('apply_options') or []):
        link = opt.get('link') or ''
        source = (opt.get('source') or '').lower()
        if link:
            opts.append({'link': link, 'source': source})
    # Fallbacks
    for key in ['share_link', 'link']:
        if job.get(key):
            try:
                host = urlparse(job.get(key)).netloc.lower()
            except Exception:
                host = ''
            opts.append({'link': job.get(key), 'source': host})
    return opts

def best_apply_link(job, preferred_provider=None):
    options = extract_apply_options(job)
    preferred = (preferred_provider or '').lower()
    if preferred:
        for o in options:
            if preferred in o.get('source', '') or preferred in o.get('link', ''):
                return o.get('link'), preferred
    # Prefer linkedin if present by default
    for o in options:
        if 'linkedin' in (o.get('source', '') or o.get('link', '')):
            return o.get('link'), 'linkedin'
    # Otherwise first option
    if options:
        src = options[0]
        src_name = src.get('source') or ''
        return src.get('link'), src_name
    return '', ''

def format_jobs_for_response(top_jobs, preferred_provider=None):
    """Format jobs for response."""
    formatted = []
    for job in top_jobs:
        link, provider = best_apply_link(job, preferred_provider)
        formatted.append({
            'title': job.get('title', ''),
            'company': job.get('company_name', ''),
            'location': job.get('location', ''),
            'source': job.get('via', ''),
            'similarity': round(job.get('similarity', 0.0) * 100, 2),
            'base_similarity': round(job.get('base_similarity', 0.0) * 100, 2),
            'domain_boost': round(job.get('domain_boost', 0.0) * 100, 2),
            'apply_link': link,
            'apply_provider': provider,
            'description': job.get('description', '')[:200] + '...' if job.get('description') else ''
        })
    return formatted

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
     port = int(os.environ.get("PORT", FLASK_PORT))
     app.run(host="0.0.0.0", port=port, debug=False)
    
