"""Format recommendations and determine job experience levels."""
import re
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)


def determine_job_experience_level(job: Dict) -> str:
    """Determine experience level required for a job."""
    title = job.get('title', '').lower()
    description = job.get('description', '').lower()
    job_text = f"{title} {description}"

    if any(word in title for word in ['fresher', 'fresh graduate', 'trainee', 'intern']):
        if 'intern' in title:
            return 'internship'
        return 'fresher'

    year_patterns = [
        r'(\d+)\s*-\s*(\d+)\s*years?',
        r'(\d+)\+\s*years?',
        r'minimum\s*(\d+)\s*years?',
        r'(\d+)\s*to\s*(\d+)\s*years?',
    ]
    min_years_required = None
    for pattern in year_patterns:
        matches = re.findall(pattern, job_text)
        if matches:
            m = matches[0]
            min_years_required = int(m[0]) if isinstance(m, tuple) else int(m)
            if '+' in pattern:
                min_years_required += 1
            break

    if min_years_required is not None:
        if min_years_required <= 2:
            return 'fresher'
        if min_years_required <= 4:
            return 'mid'
        return 'senior'

    if any(w in job_text for w in ['0-1 year', '0-2 year', '0 year', 'no experience required', 'entry level', 'entry-level']):
        return 'fresher'

    experience_level = job.get('experience_level', '') or job.get('experienceLevel', '')
    if experience_level:
        el = experience_level.lower()
        if any(t in el for t in ['intern', 'internship']):
            return 'internship'
        if any(t in el for t in ['entry', 'fresher', 'graduate']):
            return 'fresher'
        if any(t in el for t in ['mid-senior', 'senior', 'lead', 'principal']):
            if 'fresher' in job_text or 'fresh graduate' in job_text:
                return 'fresher'
            return 'senior'
        if any(t in el for t in ['mid', 'associate']):
            return 'mid'

    if any(w in job_text for w in ['internship', 'intern ']):
        return 'internship'
    if any(w in job_text for w in ['senior', 'lead', 'principal', 'architect']):
        return 'senior'
    if any(w in job_text for w in ['mid level', 'mid-level', 'intermediate']):
        return 'mid'

    if any(w in title for w in ['senior', 'lead', 'principal']):
        return 'senior'
    if any(w in title for w in ['junior', 'graduate']):
        return 'fresher'
    return 'mid'


def format_recommendations(
    jobs_data: List[Dict],
    scored_jobs: List[Tuple[int, float]],
    resume_analysis: Dict,
) -> List[Dict]:
    """Format job recommendations for API response."""
    recommendations = []
    seen_job_ids = set()
    seen_job_urls = set()
    seen_title_company = set()

    for idx, score in scored_jobs:
        if idx >= len(jobs_data):
            continue

        job = jobs_data[idx]
        job_id = job.get('id', '')
        job_url = job.get('job_url', '') or job.get('jobUrl', '')
        apply_url = job.get('apply_url', '') or job.get('applyUrl', '')

        title_raw = job.get('title', '').strip().lower()
        company_raw = job.get('companyName', job.get('company', '')).strip().lower()

        title_normalized = re.sub(r'\s*\(.*?\)\s*', '', title_raw)
        title_normalized = re.sub(r'\s*\|.*$', '', title_normalized)
        title_normalized = re.sub(r'\s*-\s*ref#?\d+.*$', '', title_normalized, flags=re.IGNORECASE)
        title_normalized = re.sub(r'\s*#\d+.*$', '', title_normalized)
        title_normalized = re.sub(r'\s+', ' ', title_normalized).strip()

        title_core = re.sub(r'\s*-\s*(remote|hybrid|onsite|work from home|wfh).*$', '', title_normalized, flags=re.IGNORECASE)
        title_core = re.sub(r'\s+', ' ', title_core).strip()

        title_company_key = f"{title_normalized}|{company_raw}"
        title_core_company_key = f"{title_core}|{company_raw}"

        if job_id and job_id in seen_job_ids:
            continue
        if job_url and job_url in seen_job_urls:
            continue
        if apply_url and apply_url in seen_job_urls:
            continue
        if title_company_key and title_normalized and company_raw and title_company_key in seen_title_company:
            continue
        if title_core_company_key and title_core and company_raw and title_core_company_key in seen_title_company:
            continue

        if job_id:
            seen_job_ids.add(job_id)
        if job_url:
            seen_job_urls.add(job_url)
        if apply_url:
            seen_job_urls.add(apply_url)
        if title_company_key and title_normalized and company_raw:
            seen_title_company.add(title_company_key)
        if title_core_company_key and title_core and company_raw:
            seen_title_company.add(title_core_company_key)

        common_skills = list(set(resume_analysis['skills']) & set(job.get('skills', [])))
        missing_skills = list(set(job.get('skills', [])) - set(resume_analysis['skills']))
        job_experience_level = determine_job_experience_level(job)
        primary_apply_link = apply_url if apply_url else job_url

        description = job.get('description', '')
        desc_preview = (description[:500] + '...') if len(description) > 500 else description

        recommendations.append({
            'id': job_id,
            'title': job.get('title', ''),
            'company': job.get('companyName', job.get('company', '')),
            'location': job.get('location', ''),
            'description': desc_preview,
            'similarity': min(100, int(score * 100)),
            'match_score': min(100, int(score * 100)),
            'experience_level': job_experience_level,
            'skills_required': job.get('skills', [])[:10],
            'skills_matched': common_skills,
            'skills_missing': missing_skills[:5],
            'contract_type': job.get('contractType', ''),
            'work_type': job.get('workType', ''),
            'sector': job.get('sector', ''),
            'apply_link': primary_apply_link,
            'posted_time': job.get('postedTime', job.get('posted_time', '')),
            'applications_count': job.get('applicationsCount', ''),
            'company_url': job.get('companyUrl', ''),
            'job_url': job_url,
            'apply_url': apply_url,
            'published_at': job.get('publishedAt', ''),
            'salary': job.get('salary', ''),
            'source': job.get('source', 'LinkedIn'),
        })

    return recommendations


def generate_search_query(resume_analysis: Dict) -> str:
    """Generate search query for external job boards."""
    top_skills = resume_analysis.get('skills', [])[:3]
    job_titles = resume_analysis.get('job_titles', [])[:2]
    query_parts = job_titles if job_titles else top_skills[:2]
    return ' '.join(query_parts) if query_parts else 'software developer'
