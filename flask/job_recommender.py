"""
Job Recommendation System using TF-IDF and Sentence Transformers
Analyzes resume content and matches with job descriptions from data.json
"""

import json
import pickle
import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# from sentence_transformers import SentenceTransformer (Lazy loaded)
import logging
from typing import List, Dict, Tuple, Optional
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobRecommender:
    def __init__(self, data_path: str = None, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the Job Recommender (Stateless Mode)
        
        Args:
            data_path: Path to the jobs JSON file (defaults to data.json in same dir)
            model_name: Sentence transformer model name
        """
        if data_path is None:
            # Use absolute path relative to this file to ensure it works on Render
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(base_dir, "data.json")
            
        self.data_path = data_path
        self.model_name = model_name
        self.jobs_data = []
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.sentence_model = None
        self.job_embeddings = None
        
        # Load jobs data for recommendations only (no persistence)
        self.load_jobs_data()
        
        # Initialize models lazily (only when needed for faster startup)
        self._models_initialized = False
    
    def load_jobs_data(self):
        """Load jobs data from JSON files (LinkedIn/SerpAPI + Naukri)"""
        all_jobs = []
        
        # 1. Load primary data (LinkedIn/SerpAPI)
        print(f"DEBUG: Loading primary data from {self.data_path}")
        try:
            if os.path.exists(self.data_path):
                with open(self.data_path, 'r', encoding='utf-8') as f:
                    primary_jobs = json.load(f)
                print(f"DEBUG: Loaded {len(primary_jobs)} jobs from {self.data_path}")
                all_jobs.extend(primary_jobs)
            else:
                print(f"DEBUG: Primary data file not found: {self.data_path}")
                logger.error(f"Primary jobs data file not found: {self.data_path}")
        except Exception as e:
            print(f"DEBUG: Error loading primary jobs: {e}")
            logger.error(f"Error loading primary jobs data: {e}")

        # 2. Load Naukri data
        # Ensure we look in the same directory as data_path
        data_dir = os.path.dirname(os.path.abspath(self.data_path))
        naukri_path = os.path.join(data_dir, "naukridatas.json")
        
        print(f"DEBUG: Attempting to load Naukri data from {naukri_path}")
        
        try:
            if os.path.exists(naukri_path):
                with open(naukri_path, 'r', encoding='utf-8') as f:
                    naukri_jobs = json.load(f)
                
                print(f"DEBUG: Loaded {len(naukri_jobs)} raw entries from Naukri file")
                
                # Normalize Naukri data to match internal schema
                normalized_naukri_jobs = self.normalize_naukri_jobs(naukri_jobs)
                all_jobs.extend(normalized_naukri_jobs)
                print(f"DEBUG: Added {len(normalized_naukri_jobs)} normalized Naukri jobs")
            else:
                print(f"DEBUG: Naukri file does not exist at {naukri_path}")
                logger.warning(f"Naukri data file not found: {naukri_path}")
        except Exception as e:
            print(f"DEBUG: Error loading Naukri data: {e}")
            logger.error(f"Error loading Naukri data: {e}")

        # Remove duplicates
        self.jobs_data = self.remove_duplicates(all_jobs)
        print(f"DEBUG: Total unique jobs after deduplication: {len(self.jobs_data)}")
        logger.info(f"After deduplication: {len(self.jobs_data)} unique jobs")
        
        # Clean and preprocess job data
        self.preprocess_jobs()

    def normalize_naukri_jobs(self, naukri_jobs: List[Dict]) -> List[Dict]:
        """Normalize Naukri job data to match the primary data schema"""
        normalized = []
        for job in naukri_jobs:
            try:
                # Skip invalid entries
                if not job.get('jobId') or not job.get('title'):
                    continue
                    
                # Extract skills from tagsAndSkills string
                skills_str = job.get('tagsAndSkills', '')
                skills = [s.strip() for s in skills_str.split(',')] if skills_str else []
                
                # Normalize experience level
                exp_text = job.get('experienceText') or job.get('experience') or "0 Yrs"
                
                # Map experience range to standard levels
                standard_level = "Entry level" # Default
                try:
                    # Extract numbers from "0-2 Yrs" or similar
                    import re
                    years = [int(x) for x in re.findall(r'\d+', exp_text)]
                    if years:
                        min_exp = years[0]
                        if min_exp == 0:  # 0 or 0-X
                            standard_level = "Entry level"
                        elif min_exp < 3: # 1-X, 2-X
                            standard_level = "Entry level"
                        elif min_exp < 6: # 3-5, 4-6
                            standard_level = "Mid-Senior level"
                        else:             # 6+
                            standard_level = "Senior level"
                except:
                    pass
                
                # Construct apply URL
                apply_url = job.get('jdURL') or job.get('companyJobsUrl') or ""
                
                # Create normalized entry
                normalized_job = {
                    'id': str(job.get('jobId')),
                    'title': job.get('title', ''),
                    'companyName': job.get('companyName', ''),
                    'company': job.get('companyName', ''),  # redundancy for safety
                    'location': job.get('location', ''),
                    'description': job.get('jobDescription', ''),
                    'descriptionHtml': job.get('jobDescription', '').replace('\n', '<br>'), # Simple conversion
                    'skills': skills,
                    'experienceLevel': standard_level, 
                    'experience_level': standard_level, # redundancy
                    'contractType': 'Full-time', # Default assumption
                    'workType': 'Full-time', # Default
                    'sector': '', # Not always available
                    'applyUrl': apply_url,
                    'apply_url': apply_url,
                    'jobUrl': apply_url, # Naukri jobs are direct
                    'job_url': apply_url,
                    'postedTime': job.get('footerPlaceholderLabel') or job.get('createdDate', ''),
                    'salary': job.get('salary', 'Not disclosed'),
                    'source': 'Naukri'
                }
                normalized.append(normalized_job)
            except Exception as e:
                logger.warning(f"Error normalizing Naukri job {job.get('jobId', 'unknown')}: {e}")
                continue
        return normalized
    
    def remove_duplicates(self, jobs_data):
        """Remove duplicate jobs based on ID and title+company combination"""
        seen_ids = set()
        seen_combinations = set()
        unique_jobs = []
        
        for job in jobs_data:
            job_id = job.get('id', '')
            title = job.get('title', '').strip().lower()
            company = job.get('companyName', '').strip().lower()
            combination = f"{title}|{company}"
            
            # Skip if we've seen this ID or title+company combination
            if job_id and job_id in seen_ids:
                logger.debug(f"Skipping duplicate job ID: {job_id}")
                continue
            
            if combination in seen_combinations and title and company:
                logger.debug(f"Skipping duplicate job combination: {title} at {company}")
                continue
            
            # Add to seen sets
            if job_id:
                seen_ids.add(job_id)
            if title and company:
                seen_combinations.add(combination)
            
            unique_jobs.append(job)
        
        return unique_jobs
    
    def preprocess_jobs(self):
        """Clean and preprocess job descriptions"""
        processed_jobs = []
        
        for job in self.jobs_data:
            try:
                # Extract and clean job description
                description = job.get('description', '') or job.get('descriptionHtml', '')
                if description:
                    # Remove HTML tags
                    description = re.sub(r'<[^>]+>', ' ', description)
                    # Remove extra whitespace
                    description = re.sub(r'\s+', ' ', description).strip()
                    
                    # Create processed job entry
                    # Preserve existing skills if available
                    existing_skills = job.get('skills', [])
                    extracted_skills = self.extract_skills_from_description(description)
                    final_skills = list(set(existing_skills + extracted_skills)) if existing_skills else extracted_skills

                    processed_job = {
                        'id': job.get('id', ''),
                        'title': job.get('title', ''),
                        'company': job.get('companyName', '') or job.get('company', ''),
                        'location': job.get('location', ''),
                        'description': description,
                        'skills': final_skills,
                        'experience_level': job.get('experienceLevel', '') or job.get('experience_level', ''),
                        'contract_type': job.get('contractType', ''),
                        'work_type': job.get('workType', ''),
                        'sector': job.get('sector', ''),
                        'apply_url': job.get('applyUrl', '') or job.get('apply_url', ''),
                        'job_url': job.get('jobUrl', '') or job.get('job_url', ''),
                        'posted_time': job.get('postedTime', '') or job.get('posted_time', ''),
                        'applications_count': job.get('applicationsCount', ''),
                        'source': job.get('source', 'LinkedIn'), # Default to LinkedIn if missing
                        'combined_text': self.create_combined_text(job, description)
                    }
                    processed_jobs.append(processed_job)
                    
            except Exception as e:
                logger.warning(f"Error processing job {job.get('id', 'unknown')}: {e}")
                continue
        
        self.jobs_data = processed_jobs
        logger.info(f"Preprocessed {len(self.jobs_data)} jobs successfully")
    
    def extract_skills_from_description(self, description: str) -> List[str]:
        """Extract technical skills from job description"""
        # Common technical skills patterns
        skill_patterns = {
            # Programming Languages
            'Python', 'JavaScript', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'Ruby', 'R',
            # Frontend
            'React', 'Angular', 'Vue', 'HTML', 'CSS', 'jQuery', 'Bootstrap', 'Tailwind', 'Sass', 'Less',
            # Backend
            'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'ASP.NET', 'FastAPI',
            # Databases
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB',
            # Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'Terraform', 'Ansible',
            # Data & ML
            'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Spark', 'Hadoop', 'Kafka',
            # Mobile
            'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin',
            # Testing
            'Jest', 'Selenium', 'Cypress', 'JUnit', 'PyTest',
            # Methodologies
            'Agile', 'Scrum', 'DevOps', 'CI/CD', 'TDD', 'BDD'
        }
        
        found_skills = []
        description_lower = description.lower()
        
        for skill in skill_patterns:
            # Create regex pattern for skill matching
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, description_lower):
                found_skills.append(skill)
        
        return found_skills
    
    def create_combined_text(self, job: Dict, description: str) -> str:
        """Create combined text for better matching"""
        title = job.get('title', '')
        company = job.get('companyName', '')
        location = job.get('location', '')
        sector = job.get('sector', '')
        work_type = job.get('workType', '')
        
        # Combine all relevant text fields
        combined = f"{title} {company} {location} {sector} {work_type} {description}"
        return combined.strip()
    
    def _ensure_models_initialized(self):
        """Ensure models are initialized (lazy loading)"""
        if self._models_initialized:
            return
        
        logger.info("Initializing models (lazy loading)...")
        self.initialize_models()
        self._models_initialized = True
    
    def initialize_models(self):
        """Initialize TF-IDF and Sentence Transformer models"""
        if not self.jobs_data:
            logger.warning("No jobs data available for model initialization")
            return
        
        try:
            # Initialize TF-IDF
            logger.info("Initializing TF-IDF vectorizer...")
            
            # Cache file path
            cache_file = os.path.join(os.path.dirname(self.data_path), 'model_cache.pkl')
            
            # Check if cache exists and is valid
            if self._load_from_cache(cache_file):
                return

            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.8
            )
            
            # Create TF-IDF matrix from job descriptions
            job_texts = [job['combined_text'] for job in self.jobs_data]
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(job_texts)
            
            # Initialize Sentence Transformer
            logger.info(f"Loading Sentence Transformer model: {self.model_name}")
            from sentence_transformers import SentenceTransformer
            self.sentence_model = SentenceTransformer(self.model_name)
            
            # Create embeddings for all jobs
            logger.info("Creating job embeddings...")
            self.job_embeddings = self.sentence_model.encode(job_texts, show_progress_bar=True)
            
            # Save to cache
            self._save_to_cache(cache_file)
            
            logger.info("Models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")

    def _load_from_cache(self, cache_file: str) -> bool:
        """Load models from cache if valid"""
        try:
            if not os.path.exists(cache_file):
                return False
                
            # Check modification times
            cache_mtime = os.path.getmtime(cache_file)
            data_mtime = os.path.getmtime(self.data_path)
            
            # Check Naukri data mtime as well
            naukri_path = os.path.join(os.path.dirname(self.data_path), "naukridatas.json")
            if os.path.exists(naukri_path):
                naukri_mtime = os.path.getmtime(naukri_path)
                if naukri_mtime > cache_mtime:
                    logger.info("Cache invalid: Naukri data newer than cache")
                    return False

            if data_mtime > cache_mtime:
                logger.info("Cache invalid: Data file newer than cache")
                return False
                
            logger.info("Loading models from cache...")
            with open(cache_file, 'rb') as f:
                data = pickle.load(f)
                
            self.tfidf_vectorizer = data['tfidf_vectorizer']
            self.tfidf_matrix = data['tfidf_matrix']
            self.job_embeddings = data['job_embeddings']
            # We still need re-init sentence model for inference (it's not pickled usually)
            from sentence_transformers import SentenceTransformer
            self.sentence_model = SentenceTransformer(self.model_name)
            
            # Verify data consistency (simple check)
            if self.tfidf_matrix.shape[0] != len(self.jobs_data):
                logger.warning("Cache mismatch: Job count differs")
                return False
                
            logger.info("Models loaded from cache successfully")
            return True
            
        except Exception as e:
            logger.warning(f"Failed to load cache: {e}")
            return False

    def _save_to_cache(self, cache_file: str):
        """Save models to cache"""
        try:
            logger.info("Saving models to cache...")
            with open(cache_file, 'wb') as f:
                pickle.dump({
                    'tfidf_vectorizer': self.tfidf_vectorizer,
                    'tfidf_matrix': self.tfidf_matrix,
                    'job_embeddings': self.job_embeddings
                }, f)
            logger.info("Cache saved successfully")
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")
            

    
    def extract_resume_skills(self, resume_text: str) -> List[str]:
        """Extract skills from resume text"""
        return self.extract_skills_from_description(resume_text)
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume and extract key information"""
        try:
            # Extract skills
            skills = self.extract_resume_skills(resume_text)
            
            # Extract experience level (simple heuristic)
            experience_years = self.extract_experience_years(resume_text)
            
            # Extract job titles/roles
            job_titles = self.extract_job_titles(resume_text)
            
            # Extract education
            education = self.extract_education(resume_text)
            
            # Determine experience level
            experience_level = self.determine_experience_level(resume_text, experience_years)
            
            return {
                'skills': skills,
                'experience_years': experience_years,
                'experience_level': experience_level,
                'job_titles': job_titles,
                'education': education,
                'resume_length': len(resume_text.split())
            }
            
        except Exception as e:
            logger.error(f"Error analyzing resume: {e}")
            return {'skills': [], 'experience_years': 0, 'job_titles': [], 'education': []}
    
    def extract_experience_years(self, resume_text: str) -> int:
        """Extract years of experience from resume"""
        # Look for patterns like "3 years", "5+ years", etc.
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*in',
            r'experience\s*:\s*(\d+)\+?\s*years?'
        ]
        
        max_years = 0
        resume_lower = resume_text.lower()
        
        for pattern in patterns:
            matches = re.findall(pattern, resume_lower)
            for match in matches:
                try:
                    years = int(match)
                    max_years = max(max_years, years)
                except ValueError:
                    continue
        
        return max_years
    
    def determine_experience_level(self, resume_text: str, experience_years: int) -> str:
        """Determine experience level based on resume content and years"""
        resume_lower = resume_text.lower()
        
        # Check for fresher/entry-level indicators
        fresher_keywords = [
            'fresher', 'fresh graduate', 'recent graduate', 'entry level', 'entry-level',
            'new graduate', 'college graduate', 'university graduate', 'just graduated',
            'seeking first job', 'no experience', 'looking for opportunity', 'internship',
            'trainee', 'associate', 'beginner', 'starting career'
        ]
        
        # Check for senior/experienced indicators
        senior_keywords = [
            'senior', 'lead', 'principal', 'architect', 'manager', 'director',
            'team lead', 'tech lead', 'technical lead', 'head of', 'chief',
            'expert', 'specialist', 'consultant', 'mentor', 'supervisor'
        ]
        
        # Count keyword occurrences
        fresher_count = sum(1 for keyword in fresher_keywords if keyword in resume_lower)
        senior_count = sum(1 for keyword in senior_keywords if keyword in resume_lower)
        
        # Determine level based on experience years and keywords
        if experience_years == 0 or fresher_count > 0:
            return 'fresher'
        elif experience_years >= 5 or senior_count > 0:
            return 'senior'
        elif experience_years >= 2:
            return 'mid'
        else:
            return 'junior'
    
    def extract_job_titles(self, resume_text: str) -> List[str]:
        """Extract job titles from resume"""
        # Common job title patterns
        title_patterns = [
            r'(?:software|web|frontend|backend|full.stack|mobile)\s+(?:engineer|developer|programmer)',
            r'(?:senior|junior|lead|principal)\s+(?:engineer|developer|programmer)',
            r'(?:data|machine learning|ai)\s+(?:scientist|engineer|analyst)',
            r'(?:product|project)\s+manager',
            r'(?:devops|cloud|infrastructure)\s+engineer',
            r'(?:ui|ux)\s+(?:designer|developer)',
            r'(?:quality assurance|qa)\s+(?:engineer|tester)',
            r'(?:business|systems)\s+analyst'
        ]
        
        found_titles = []
        resume_lower = resume_text.lower()
        
        for pattern in title_patterns:
            matches = re.findall(pattern, resume_lower)
            found_titles.extend(matches)
        
        return list(set(found_titles))
    
    def determine_job_experience_level(self, job: Dict) -> str:
        """Determine experience level required for a job"""
        # Get job text for analysis
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()
        job_text = f"{title} {description}"
        
        # PRIORITY 1: Check title for EXPLICIT fresher/internship indicators
        # This prevents jobs titled "Fresher" from being misclassified as senior
        if any(word in title for word in ['fresher', 'fresh graduate', 'trainee', 'intern']):
            # Check if it's specifically an internship
            if 'intern' in title:
                return 'internship'
            return 'fresher'
        
        # PRIORITY 2: Extract numeric year requirements from description
        year_patterns = [
            r'(\d+)\s*-\s*(\d+)\s*years?',  # "3-5 years"
            r'(\d+)\+\s*years?',              # "5+ years"
            r'minimum\s*(\d+)\s*years?',      # "minimum 3 years"
            r'(\d+)\s*to\s*(\d+)\s*years?',  # "3 to 7 years"
        ]
        
        min_years_required = None
        is_plus_pattern = False
        
        for pattern in year_patterns:
            matches = re.findall(pattern, job_text)
            if matches:
                if isinstance(matches[0], tuple):
                    min_years_required = int(matches[0][0])
                else:
                    min_years_required = int(matches[0])
                    # Check if this is a "+" pattern (e.g., "2+ years")
                    if '+' in pattern:
                        # "2+ years" means MORE than 2, so treat as requiring 3 years
                        min_years_required += 1
                        is_plus_pattern = True
                break
        
        # If we found a year requirement, use it
        if min_years_required is not None:
            if min_years_required == 0:
                return 'fresher'
            elif min_years_required <= 2:
                return 'fresher'
            elif min_years_required <= 4:
                return 'mid'
            else:
                return 'senior'
        
        # PRIORITY 3: Check description for fresher/entry-level keywords
        if any(word in job_text for word in ['0-1 year', '0-2 year', '0 year', 'no experience required', 'entry level', 'entry-level']):
            return 'fresher'
        
        # PRIORITY 4: Now check the experienceLevel field from LinkedIn/Naukri
        experience_level = job.get('experience_level', '') or job.get('experienceLevel', '')
        
        if experience_level:
            experience_level_lower = experience_level.lower()
            
            # Explicitly detect internship roles
            if any(term in experience_level_lower for term in ['intern', 'internship']):
                return 'internship'
            
            # Map LinkedIn experience levels to our system
            if any(term in experience_level_lower for term in ['entry', 'fresher', 'graduate']):
                return 'fresher'
            elif any(term in experience_level_lower for term in ['mid-senior', 'senior', 'lead', 'principal']):
                # Double-check: if description mentions "fresher" explicitly, override
                if 'fresher' in job_text or 'fresh graduate' in job_text:
                    return 'fresher'
                return 'senior'
            elif any(term in experience_level_lower for term in ['mid', 'associate']):
                return 'mid'
        
        # PRIORITY 5: Check for other keyword indicators in description
        if any(word in job_text for word in ['internship', 'intern ']):
            return 'internship'
        elif any(word in job_text for word in ['senior', 'lead', 'principal', 'architect']):
            return 'senior'
        elif any(word in job_text for word in ['mid level', 'mid-level', 'intermediate']):
            return 'mid'
        else:
            # Default based on title
            if any(word in title for word in ['senior', 'lead', 'principal']):
                return 'senior'
            elif any(word in title for word in ['junior', 'graduate']):
                return 'fresher'
            else:
                return 'mid'



    def extract_education(self, resume_text: str) -> List[str]:
        """Extract education information from resume"""
        education_patterns = [
            r'(?:bachelor|master|phd|doctorate).*?(?:computer science|engineering|mathematics|physics)',
            r'(?:b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?e|m\.?e)',
            r'(?:university|college|institute).*?(?:computer|engineering|technology)'
        ]
        
        found_education = []
        resume_lower = resume_text.lower()
        
        for pattern in education_patterns:
            matches = re.findall(pattern, resume_lower)
            found_education.extend(matches)
        
        return list(set(found_education))
    
    def calculate_tfidf_similarity(self, resume_text: str, top_k: int = 50) -> List[Tuple[int, float]]:
        """Calculate TF-IDF based similarity scores"""
        if self.tfidf_vectorizer is None or self.tfidf_matrix is None:
            logger.warning("TF-IDF models not initialized")
            return []
        
        try:
            # Transform resume text
            resume_vector = self.tfidf_vectorizer.transform([resume_text])
            
            # Calculate cosine similarity
            similarities = cosine_similarity(resume_vector, self.tfidf_matrix).flatten()
            
            # Get top matches (include all matches, even with low similarity)
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            logger.info(f"TF-IDF: Found {len(similarities)} total similarities, max: {similarities.max():.4f}")
            
            # Return all matches (remove the > 0 filter to get more results)
            return [(idx, similarities[idx]) for idx in top_indices]
            
        except Exception as e:
            logger.error(f"Error calculating TF-IDF similarity: {e}")
            return []
    
    def calculate_embedding_similarity(self, resume_text: str, top_k: int = 50) -> List[Tuple[int, float]]:
        """Calculate embedding-based similarity scores"""
        if self.sentence_model is None or self.job_embeddings is None:
            logger.warning("Embedding models not initialized")
            return []
        
        try:
            # Create resume embedding
            resume_embedding = self.sentence_model.encode([resume_text])
            
            # Calculate cosine similarity
            similarities = cosine_similarity(resume_embedding, self.job_embeddings).flatten()
            
            # Get top matches (include all matches, even with low similarity)
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            logger.info(f"Embeddings: Found {len(similarities)} total similarities, max: {similarities.max():.4f}")
            
            # Return all matches (remove the > 0 filter to get more results)
            return [(idx, similarities[idx]) for idx in top_indices]
            
        except Exception as e:
            logger.error(f"Error calculating embedding similarity: {e}")
            return []
    
    def calculate_skill_match_score(self, resume_skills: List[str], job_skills: List[str]) -> float:
        """Calculate skill-based matching score"""
        if not resume_skills or not job_skills:
            return 0.0
        
        # Convert to lowercase for comparison
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        # Calculate intersection
        common_skills = set(resume_skills_lower) & set(job_skills_lower)
        
        # Calculate Jaccard similarity
        union_skills = set(resume_skills_lower) | set(job_skills_lower)
        
        if len(union_skills) == 0:
            return 0.0
        
        return len(common_skills) / len(union_skills)
    
    def recommend_jobs(self, resume_text: str, location_filter: str = None, top_k: int = 10) -> Dict:
        """
        Main recommendation function (Stateless - No Data Storage)
        
        Args:
            resume_text: Resume content as text
            location_filter: Optional location filter
            top_k: Number of top recommendations to return
            
        Returns:
            Dictionary with recommendations and metadata (no user data stored)
        """
        try:
            if not self.jobs_data:
                return {
                    'success': False,
                    'error': 'No jobs data available',
                    'top_jobs': [],
                    'resume_analysis': {}
                }
            
            # Ensure models are initialized (lazy loading)
            self._ensure_models_initialized()
            
            # Analyze resume
            logger.info("Analyzing resume...")
            resume_analysis = self.analyze_resume(resume_text)
            
            # Console logging for resume analysis
            print("\n" + "🔍 RESUME ANALYSIS & KEYWORDS")
            print("="*60)
            print(f"🎯 Skills extracted: {len(resume_analysis.get('skills', []))}")
            print(f"📋 Skills list: {', '.join(resume_analysis.get('skills', []))}")
            print(f"💼 Experience years: {resume_analysis.get('experience_years', 0)}")
            print(f"📈 Experience level: {resume_analysis.get('experience_level', 'unknown').upper()}")
            print(f"🏢 Job titles found: {', '.join(resume_analysis.get('job_titles', []))}")
            print(f"🎓 Education: {', '.join(resume_analysis.get('education', []))}")
            print(f"📊 Resume word count: {resume_analysis.get('resume_length', 0)}")
            print("="*60)
            
            logger.info(f"Resume analysis: {len(resume_analysis.get('skills', []))} skills found")
            
            # Get TF-IDF similarities
            logger.info("Calculating TF-IDF similarities...")
            tfidf_similarities = self.calculate_tfidf_similarity(resume_text, top_k * 3)
            logger.info(f"TF-IDF returned {len(tfidf_similarities)} matches")
            
            # Get embedding similarities
            logger.info("Calculating embedding similarities...")
            embedding_similarities = self.calculate_embedding_similarity(resume_text, top_k * 3)
            logger.info(f"Embeddings returned {len(embedding_similarities)} matches")
            
            # Combine and rank results
            logger.info("Combining and ranking results...")
            combined_scores = self.combine_similarity_scores(
                tfidf_similarities, 
                embedding_similarities, 
                resume_analysis['skills'],
                location_filter,
                resume_analysis['experience_level'],
                resume_analysis.get('job_titles', [])  # Pass job titles
            )
            
            logger.info(f"Combined scoring returned {len(combined_scores)} matches")
            
            # Get top recommendations
            top_jobs = self.format_recommendations(combined_scores[:top_k], resume_analysis)
            
            # Console logging for final recommendations
            print("\n" + "🎯 JOB MATCHING RESULTS")
            print("="*60)
            print(f"📊 Total jobs analyzed: {len(self.jobs_data)}")
            print(f"🔍 Jobs after filtering: {len(combined_scores)}")
            print(f"🎯 Final recommendations: {len(top_jobs)}")
            
            if top_jobs:
                print("\n📋 TOP MATCHES:")
                for i, job in enumerate(top_jobs[:5], 1):
                    print(f"  {i}. {job['title']} at {job['company']}")
                    print(f"     📍 {job['location']}")
                    print(f"     📊 Match Score: {job['match_score']}%")
                    print(f"     ✅ Skills matched: {len(job['skills_matched'])}")
                    print(f"     ❌ Skills missing: {len(job['skills_missing'])}")
                    if job['skills_matched']:
                        print(f"     🎯 Matched skills: {', '.join(job['skills_matched'][:5])}")
                    print()
            print("="*60)
            
            logger.info(f"Final recommendations: {len(top_jobs)} jobs")
            
            # Generate search query for external job boards
            search_query = self.generate_search_query(resume_analysis)
            
            return {
                'success': True,
                'top_jobs': top_jobs,
                'resume_analysis': resume_analysis,
                'total_jobs_analyzed': len(self.jobs_data),
                'query': search_query,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in job recommendation: {e}")
            return {
                'success': False,
                'error': str(e),
                'top_jobs': [],
                'resume_analysis': {}
            }
    
    def combine_similarity_scores(self, tfidf_scores: List[Tuple[int, float]], 
                                embedding_scores: List[Tuple[int, float]], 
                                resume_skills: List[str],
                                location_filter: str = None,
                                resume_experience_level: str = None,
                                resume_job_titles: List[str] = None) -> List[Tuple[int, float]]:
        """Combine different similarity scores with weights"""
        
        # Create score dictionaries
        tfidf_dict = {idx: score for idx, score in tfidf_scores}
        embedding_dict = {idx: score for idx, score in embedding_scores}
        
        # Get all unique job indices
        all_indices = set(tfidf_dict.keys()) | set(embedding_dict.keys())
        
        combined_scores = []
        
        for idx in all_indices:
            if idx >= len(self.jobs_data):
                continue
                
            job = self.jobs_data[idx]
            
            # Apply location filter if specified (more flexible matching)
            if location_filter and location_filter.strip():
                location_keywords = location_filter.lower().split()
                job_location = job['location'].lower()
                # Check if any location keyword matches
                if not any(keyword in job_location for keyword in location_keywords):
                    continue
            
            # Apply experience level filter (strict matching)
            if resume_experience_level:
                job_experience_level = self.determine_job_experience_level(job)
                
                # Skip internship postings for fresher resumes (deprecated logic removed)
                # if resume_experience_level == 'fresher' and job_experience_level == 'internship':
                #    continue
                
                # Strict experience level matching
                if resume_experience_level == 'fresher':
                    # Strict filtering for freshers as requested: ONLY entry level/fresher jobs
                    # (Removed 'junior' to avoid mid-level overlap, added 'internship' as valid for freshers)
                    allowed_levels = ['fresher', 'internship']
                elif resume_experience_level == 'junior':
                    # Junior can apply to fresher, junior, and some mid positions
                    allowed_levels = ['fresher', 'junior', 'mid']
                elif resume_experience_level == 'mid':
                    # Mid-level can apply to junior, mid, and some senior positions
                    allowed_levels = ['junior', 'mid', 'senior']
                elif resume_experience_level == 'senior':
                    # Senior can apply to mid and senior positions
                    allowed_levels = ['mid', 'senior']
                else:
                    allowed_levels = ['fresher', 'junior', 'mid', 'senior']
                
                if job_experience_level not in allowed_levels:
                    continue
            
            # Get individual scores
            tfidf_score = tfidf_dict.get(idx, 0.0)
            embedding_score = embedding_dict.get(idx, 0.0)
            skill_score = self.calculate_skill_match_score(resume_skills, job['skills'])
            
            # Combine scores with improved weights for better matching
            # TF-IDF: 20%, Embeddings: 50%, Skills: 30% (Boosted skill importance)
            combined_score = (0.20 * tfidf_score + 
                            0.50 * embedding_score + 
                            0.30 * skill_score)
            
            # Boost score for jobs with high skill matches
            if skill_score > 0.5:
                combined_score *= 1.2  # 20% boost for high skill match
                
            # Boost for Title Match
            if resume_job_titles:
                job_title_lower = job['title'].lower()
                for title in resume_job_titles:
                    # Partial match boost
                    if title.lower() in job_title_lower or job_title_lower in title.lower():
                        combined_score *= 1.15 # 15% boost for title match
                        break
            
            combined_scores.append((idx, combined_score))
        
        # Sort by combined score
        # Sort by combined score
        combined_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Separate jobs by source for balanced mixing
        linkedin_jobs = []
        naukri_jobs = []
        
        for idx, score in combined_scores:
            if idx < len(self.jobs_data):
                job_source = self.jobs_data[idx].get('source', 'LinkedIn')
                if job_source == 'Naukri':
                    naukri_jobs.append((idx, score))
                else:
                    linkedin_jobs.append((idx, score))
        
        # Interleave jobs for 50/50 mix
        mixed_scores = []
        max_len = max(len(linkedin_jobs), len(naukri_jobs))
        
        for i in range(max_len):
            if i < len(linkedin_jobs):
                mixed_scores.append(linkedin_jobs[i])
            if i < len(naukri_jobs):
                mixed_scores.append(naukri_jobs[i])
        
        logger.info(f"Location filter: '{location_filter}' - Kept {len(combined_scores)} jobs after filtering")
        logger.info(f"Source distribution: LinkedIn={len(linkedin_jobs)}, Naukri={len(naukri_jobs)}")
        logger.info(f"Mixed results: {len(mixed_scores)} jobs (interleaved)")
        
        # Console logging for experience level filtering
        if resume_experience_level:
            print(f"\n🎯 EXPERIENCE LEVEL FILTERING")
            print(f"Resume level: {resume_experience_level.upper()}")
            print(f"Jobs matching experience level: {len(combined_scores)}")
            print(f"📊 Source Mix: LinkedIn={len(linkedin_jobs)}, Naukri={len(naukri_jobs)}")
        
        if mixed_scores:
            logger.info(f"Top score: {mixed_scores[0][1]:.4f}, Bottom score: {mixed_scores[-1][1]:.4f}")
        
        return mixed_scores
    
    def format_recommendations(self, scored_jobs: List[Tuple[int, float]], 
                             resume_analysis: Dict) -> List[Dict]:
        """Format job recommendations for API response"""
        recommendations = []
        seen_job_ids = set()      # Track duplicate IDs
        seen_job_urls = set()     # Track duplicate URLs
        seen_title_company = set()  # Track duplicate title+company combos
        
        for idx, score in scored_jobs:
            if idx >= len(self.jobs_data):
                continue
                
            job = self.jobs_data[idx]
            job_id = job.get('id', '')
            job_url = job.get('job_url', '') or job.get('jobUrl', '')
            apply_url = job.get('apply_url', '') or job.get('applyUrl', '')
            
            # Normalize title for better duplicate detection
            title_raw = job.get('title', '').strip().lower()
            company_raw = job.get('companyName', job.get('company', '')).strip().lower()
            
            # Remove common variations from title for better matching
            title_normalized = re.sub(r'\s*\(.*?\)\s*', '', title_raw)  # Remove parentheses
            title_normalized = re.sub(r'\s*\|.*$', '', title_normalized)  # Remove pipe and after
            title_normalized = re.sub(r'\s*-\s*ref#?\d+.*$', '', title_normalized, flags=re.IGNORECASE)  # Remove REF numbers
            title_normalized = re.sub(r'\s*#\d+.*$', '', title_normalized)  # Remove # numbers
            title_normalized = re.sub(r'\s+', ' ', title_normalized).strip()
            
            # Create a "core" title by removing common suffixes
            title_core = re.sub(r'\s*-\s*(remote|hybrid|onsite|work from home|wfh).*$', '', title_normalized, flags=re.IGNORECASE)
            title_core = re.sub(r'\s+', ' ', title_core).strip()
            
            title_company_key = f"{title_normalized}|{company_raw}"
            title_core_company_key = f"{title_core}|{company_raw}"
            
            # Skip duplicate jobs based on job ID
            if job_id and job_id in seen_job_ids:
                logger.debug(f"Skipping duplicate job ID: {job_id} - {title_raw}")
                continue
            
            # Skip duplicates based on job URL (often identical posting)
            if job_url and job_url in seen_job_urls:
                logger.debug(f"Skipping duplicate job URL: {job_url}")
                continue
            
            # Skip duplicates based on apply URL
            if apply_url and apply_url in seen_job_urls:
                logger.debug(f"Skipping duplicate apply URL: {apply_url}")
                continue
            
            # Skip duplicates based on normalized title + company combination
            if title_company_key and title_normalized and company_raw and title_company_key in seen_title_company:
                logger.debug(f"Skipping duplicate title/company: {title_company_key}")
                continue
            
            # Skip duplicates based on core title + company (catches "Remote work" variations)
            if title_core_company_key and title_core and company_raw and title_core_company_key in seen_title_company:
                logger.debug(f"Skipping duplicate core title/company: {title_core_company_key}")
                continue
            
            # Add to tracking sets
            if job_id:
                seen_job_ids.add(job_id)
            if job_url:
                seen_job_urls.add(job_url)
            if apply_url:
                seen_job_urls.add(apply_url)  # Add to same set to catch URL duplicates
            if title_company_key and title_normalized and company_raw:
                seen_title_company.add(title_company_key)
            if title_core_company_key and title_core and company_raw:
                seen_title_company.add(title_core_company_key)  # Also track core title
            
            # Calculate skill match details
            common_skills = list(set(resume_analysis['skills']) & set(job['skills']))
            missing_skills = list(set(job['skills']) - set(resume_analysis['skills']))
            
            # Determine job experience level
            job_experience_level = self.determine_job_experience_level(job)
            
            # Ensure we use the exact URLs from processed job data
            apply_url = job.get('apply_url', '')  # External application URL
            
            # For apply_link, prioritize apply_url (external) for applications
            # but keep job_url separate for "View Details" (LinkedIn page)
            primary_apply_link = apply_url if apply_url else job_url
            
            recommendation = {
                'id': job_id,
                'title': job.get('title', ''),
                'company': job.get('companyName', job.get('company', '')),
                'location': job.get('location', ''),
                'description': job['description'][:500] + '...' if len(job['description']) > 500 else job['description'],
                'similarity': min(100, int(score * 100)),  # Convert to percentage
                'match_score': min(100, int(score * 100)), # Explicit match score field
                'experience_level': job_experience_level,  # Job experience level requirement
                'skills_required': job['skills'][:10],  # Limit to top 10 skills
                'skills_matched': common_skills,
                'skills_missing': missing_skills[:5],  # Limit to top 5 missing
                'contract_type': job.get('contractType', ''),
                'work_type': job.get('workType', ''),
                'sector': job.get('sector', ''),
                'apply_link': primary_apply_link,  # Use exact URL from data.json
                'posted_time': job.get('postedTime', ''),
                'applications_count': job.get('applicationsCount', ''),
                'company_url': job.get('companyUrl', ''),
                'job_url': job_url,  # LinkedIn job page URL
                'apply_url': apply_url,  # Direct apply URL (external)
                'published_at': job.get('publishedAt', ''),
                'salary': job.get('salary', ''),
                'source': job.get('source', 'LinkedIn')  # Add source field for tracking
            }
            
            recommendations.append(recommendation)
        
        # Count jobs by source for logging
        naukri_count = sum(1 for job in recommendations if job.get('source') == 'Naukri')
        linkedin_count = len(recommendations) - naukri_count
        
        # Console logging for final recommendations
        print(f"\n📊 FINAL RECOMMENDATIONS BY SOURCE")
        print("="*60)
        print(f"✅ Total recommendations: {len(recommendations)}")
        print(f"🔗 LinkedIn jobs: {linkedin_count}")
        print(f"🟢 Naukri jobs: {naukri_count}")
        print("="*60)
        
        logger.info(f"Recommendations: {len(recommendations)} total (LinkedIn: {linkedin_count}, Naukri: {naukri_count})")
        
        return recommendations
    
    def generate_search_query(self, resume_analysis: Dict) -> str:
        """Generate search query for external job boards"""
        # Use top skills and job titles to create search query
        top_skills = resume_analysis['skills'][:3]
        job_titles = resume_analysis['job_titles'][:2]
        
        query_parts = []
        
        if job_titles:
            query_parts.extend(job_titles)
        elif top_skills:
            query_parts.extend(top_skills[:2])
        
        return ' '.join(query_parts) if query_parts else 'software developer'

# Example usage and testing
if __name__ == "__main__":
    # Initialize recommender
    recommender = JobRecommender()
    
    # Test with sample resume
    sample_resume = """
    John Doe
    Software Engineer
    
    Experience:
    - 3 years of experience in web development
    - Proficient in Python, JavaScript, React, Node.js
    - Experience with AWS, Docker, MongoDB
    - Built scalable web applications using Django and Flask
    
    Education:
    - Bachelor's in Computer Science
    
    Skills:
    - Programming: Python, JavaScript, Java
    - Frontend: React, HTML, CSS, Bootstrap
    - Backend: Django, Flask, Node.js, Express
    - Database: MongoDB, PostgreSQL, MySQL
    - Cloud: AWS, Docker, Kubernetes
    - Tools: Git, Jenkins, JIRA
    """
    
    # Get recommendations
    results = recommender.recommend_jobs(sample_resume, top_k=5)
    
    if results['success']:
        print(f"Found {len(results['top_jobs'])} recommendations")
        for i, job in enumerate(results['top_jobs'][:3], 1):
            print(f"\n{i}. {job['title']} at {job['company']}")
            print(f"   Similarity: {job['similarity']}%")
            print(f"   Location: {job['location']}")
            print(f"   Skills matched: {', '.join(job['skills_matched'][:5])}")
    else:
        print(f"Error: {results['error']}")

