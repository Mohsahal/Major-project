"""Load and normalize job data from JSON files."""
import json
import os
import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def get_default_data_path() -> str:
    """Return default path to jobs JSON (tries data.json, then linkedin.json)."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for name in ("data.json", "linkedin.json"):
        path = os.path.join(base_dir, name)
        if os.path.exists(path):
            return path
    return os.path.join(base_dir, "linkedin.json")


def load_jobs_data(data_path: str = None) -> List[Dict]:
    """Load jobs from linkedin.json and naukridatas.json, then deduplicate."""
    if data_path is None:
        data_path = get_default_data_path()
    all_jobs = []

    # Load primary data
    try:
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                primary_jobs = json.load(f)
            all_jobs.extend(primary_jobs)
            logger.info(f"Loaded {len(primary_jobs)} jobs from {data_path}")
        else:
            logger.error(f"Primary jobs file not found: {data_path}")
    except Exception as e:
        logger.error(f"Error loading primary jobs: {e}")

    # Load Naukri data
    data_dir = os.path.dirname(os.path.abspath(data_path))
    naukri_path = os.path.join(data_dir, "naukridatas.json")
    
    try:
        if os.path.exists(naukri_path):
            with open(naukri_path, 'r', encoding='utf-8') as f:
                naukri_jobs = json.load(f)
            normalized = normalize_naukri_jobs(naukri_jobs)
            all_jobs.extend(normalized)
            logger.info(f"Loaded {len(normalized)} Naukri jobs")
        else:
            logger.warning(f"Naukri file not found: {naukri_path}")
    except Exception as e:
        logger.error(f"Error loading Naukri data: {e}")

    return remove_duplicates(all_jobs)


def normalize_naukri_jobs(naukri_jobs: List[Dict]) -> List[Dict]:
    """Normalize Naukri job data to match primary schema."""
    normalized = []
    for job in naukri_jobs:
        try:
            if not job.get('jobId') or not job.get('title'):
                continue
                
            skills_str = job.get('tagsAndSkills', '')
            skills = [s.strip() for s in skills_str.split(',')] if skills_str else []
            exp_text = job.get('experienceText') or job.get('experience') or "0 Yrs"
            standard_level = _parse_experience_level(exp_text)
            apply_url = job.get('jdURL') or job.get('companyJobsUrl') or ""
            
            normalized.append({
                'id': str(job.get('jobId')),
                'title': job.get('title', ''),
                'companyName': job.get('companyName', ''),
                'company': job.get('companyName', ''),
                'location': job.get('location', ''),
                'description': job.get('jobDescription', ''),
                'descriptionHtml': job.get('jobDescription', '').replace('\n', '<br>'),
                'skills': skills,
                'experienceLevel': standard_level,
                'experience_level': standard_level,
                'contractType': 'Full-time',
                'workType': 'Full-time',
                'sector': '',
                'applyUrl': apply_url,
                'apply_url': apply_url,
                'jobUrl': apply_url,
                'job_url': apply_url,
                'postedTime': job.get('footerPlaceholderLabel') or job.get('createdDate', ''),
                'salary': job.get('salary', 'Not disclosed'),
                'source': 'Naukri'
            })
        except Exception as e:
            logger.warning(f"Error normalizing job {job.get('jobId')}: {e}")
    return normalized


def _parse_experience_level(exp_text: str) -> str:
    """Map experience text to standard level."""
    try:
        years = [int(x) for x in re.findall(r'\d+', exp_text)]
        if years:
            min_exp = years[0]
            if min_exp == 0:
                return "Entry level"
            elif min_exp < 6:
                return "Mid-Senior level"
            return "Senior level"
    except (ValueError, IndexError):
        pass
    return "Entry level"


def remove_duplicates(jobs_data: List[Dict]) -> List[Dict]:
    """Remove duplicate jobs by ID and title+company."""
    seen_ids = set()
    seen_combinations = set()
    unique = []
    
    for job in jobs_data:
        job_id = job.get('id', '')
        title = job.get('title', '').strip().lower()
        company = job.get('companyName', '').strip().lower()
        combo = f"{title}|{company}"
        
        if job_id and job_id in seen_ids:
            continue
        if combo in seen_combinations and title and company:
            continue
            
        if job_id:
            seen_ids.add(job_id)
        if title and company:
            seen_combinations.add(combo)
        unique.append(job)
    
    return unique
