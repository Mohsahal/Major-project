"""Resume analysis and extraction."""
import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def analyze_resume(resume_text: str) -> Dict:
    """Analyze resume and extract key information."""
    try:
        skills = extract_skills_from_description(resume_text)
        experience_years = extract_experience_years(resume_text)
        job_titles = extract_job_titles(resume_text)
        education = extract_education(resume_text)
        experience_level = determine_experience_level(resume_text, experience_years)
        
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


def extract_skills_from_description(text: str) -> List[str]:
    """Extract skills from resume text."""
    from .preprocessing import extract_skills_from_description as _extract
    return _extract(text)


def extract_experience_years(resume_text: str) -> int:
    """Extract years of experience from resume."""
    patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'(\d+)\+?\s*years?\s*in',
        r'experience\s*:\s*(\d+)\+?\s*years?'
    ]
    max_years = 0
    text_lower = resume_text.lower()
    for pattern in patterns:
        for match in re.findall(pattern, text_lower):
            try:
                max_years = max(max_years, int(match))
            except ValueError:
                continue
    return max_years


def determine_experience_level(resume_text: str, experience_years: int) -> str:
    """Determine experience level from resume content."""
    text_lower = resume_text.lower()
    fresher_keywords = ['fresher', 'fresh graduate', 'recent graduate', 'entry level', 'internship', 'trainee']
    senior_keywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director', 'expert', 'mentor']
    
    fresher_count = sum(1 for k in fresher_keywords if k in text_lower)
    senior_count = sum(1 for k in senior_keywords if k in text_lower)
    
    if experience_years == 0 or fresher_count > 0:
        return 'fresher'
    if experience_years >= 5 or senior_count > 0:
        return 'senior'
    if experience_years >= 2:
        return 'mid'
    return 'junior'


def extract_job_titles(resume_text: str) -> List[str]:
    """Extract job titles from resume."""
    patterns = [
        r'(?:software|web|frontend|backend|full.stack|mobile)\s+(?:engineer|developer|programmer)',
        r'(?:senior|junior|lead|principal)\s+(?:engineer|developer|programmer)',
        r'(?:data|machine learning|ai)\s+(?:scientist|engineer|analyst)',
        r'(?:product|project)\s+manager',
        r'(?:devops|cloud|infrastructure)\s+engineer',
    ]
    found = []
    text_lower = resume_text.lower()
    for pattern in patterns:
        found.extend(re.findall(pattern, text_lower))
    return list(set(found))


def extract_education(resume_text: str) -> List[str]:
    """Extract education from resume."""
    patterns = [
        r'(?:bachelor|master|phd).*?(?:computer science|engineering)',
        r'(?:b\.?tech|m\.?tech|b\.?sc|m\.?sc)',
        r'(?:university|college|institute).*?(?:computer|engineering)'
    ]
    found = []
    text_lower = resume_text.lower()
    for pattern in patterns:
        found.extend(re.findall(pattern, text_lower))
    return list(set(found))
