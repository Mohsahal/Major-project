#!/usr/bin/env python3
"""
Skill Gap Analysis Module for Job Recommendation System.
Handles skill extraction, analysis, and learning recommendations.
"""

import os
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from googleapiclient.discovery import build

class SkillGapAnalyzer:
    def __init__(self, gemini_api_key=None, youtube_api_key=None):
        """Initialize the SkillGapAnalyzer with API keys."""
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.youtube_api_key = youtube_api_key or os.getenv("YOUTUBE_API_KEY")
        
        # Initialize YouTube client if API key is available
        self.youtube = None
        if self.youtube_api_key:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.youtube_api_key)
            except Exception as e:
                print(f"Failed to initialize YouTube API client: {e}")

    def analyze_skill_gap(self, resume_text, job_description):
        """Analyze skill gap between resume and job description."""
        try:
            if not self.gemini_api_key:
                raise Exception("GEMINI_API_KEY not configured")
            
            # First, extract skills from both resume and job description using a more direct approach
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.1,
                max_output_tokens=2000,
                google_api_key=self.gemini_api_key
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
                job_skills = self.extract_skills_from_text(job_description)
            
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
                resume_skills = self.extract_skills_from_text(resume_text)
            
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
            return self.extract_skills_fallback_improved(resume_text, job_description)

    def extract_skills_from_text(self, text):
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

    def extract_skills_fallback_improved(self, resume_text, job_description):
        """Improved fallback method to extract skills using regex patterns."""
        # Extract skills from both texts
        job_skills = self.extract_skills_from_text(job_description)
        resume_skills = self.extract_skills_from_text(resume_text)
        
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

    def get_youtube_videos(self, skill, max_results=3):
        """Get YouTube video suggestions for a skill."""
        if not self.youtube:
            return []
        
        try:
            request = self.youtube.search().list(
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

    def generate_learning_recommendations(self, missing_skills):
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

    def analyze_skill_gap_with_resources(self, resume_text, job_description):
        """Complete skill gap analysis with learning resources."""
        # Analyze skill gap
        skill_analysis = self.analyze_skill_gap(resume_text, job_description)
        
        # Get YouTube videos for missing skills
        missing_skills_videos = {}
        if skill_analysis.get('missing_skills'):
            for skill in skill_analysis['missing_skills'][:5]:  # Limit to 5 skills
                videos = self.get_youtube_videos(skill)
                if videos:
                    missing_skills_videos[skill] = videos
        
        # Generate learning recommendations
        learning_recommendations = self.generate_learning_recommendations(
            skill_analysis.get('missing_skills', [])
        )
        
        return {
            'analysis': skill_analysis,
            'learning_resources': {
                'youtube_videos': missing_skills_videos,
                'recommendations': learning_recommendations
            }
        }
