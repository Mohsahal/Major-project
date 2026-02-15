"""Job text preprocessing and skill extraction."""
import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

SKILL_PATTERNS = {
    'Python', 'JavaScript', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'Ruby', 'R',
    'React', 'Angular', 'Vue', 'HTML', 'CSS', 'jQuery', 'Bootstrap', 'Tailwind', 'Sass', 'Less',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'ASP.NET', 'FastAPI',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'Terraform', 'Ansible',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Spark', 'Hadoop', 'Kafka',
    'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin',
    'Jest', 'Selenium', 'Cypress', 'JUnit', 'PyTest',
    'Agile', 'Scrum', 'DevOps', 'CI/CD', 'TDD', 'BDD'
}


def preprocess_jobs(jobs_data: List[Dict]) -> List[Dict]:
    """Clean job descriptions and create combined text."""
    processed = []
    for job in jobs_data:
        try:
            desc = job.get('description', '') or job.get('descriptionHtml', '')
            if desc:
                desc = re.sub(r'<[^>]+>', ' ', desc)
                desc = re.sub(r'\s+', ' ', desc).strip()
            
            existing_skills = job.get('skills', [])
            extracted = extract_skills_from_description(desc)
            final_skills = list(set(existing_skills + extracted)) if existing_skills else extracted

            processed.append({
                **job,
                'description': desc,
                'skills': final_skills,
                'combined_text': create_combined_text(job, desc)
            })
        except Exception as e:
            logger.warning(f"Error processing job {job.get('id')}: {e}")
    return processed


def extract_skills_from_description(description: str) -> List[str]:
    """Extract technical skills from job description."""
    if not description:
        return []
    found = []
    desc_lower = description.lower()
    for skill in SKILL_PATTERNS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, desc_lower):
            found.append(skill)
    return found


def create_combined_text(job: Dict, description: str) -> str:
    """Create combined text for matching."""
    parts = [
        job.get('title', ''),
        job.get('companyName', ''),
        job.get('location', ''),
        job.get('sector', ''),
        job.get('workType', ''),
        description
    ]
    return ' '.join(str(p) for p in parts if p).strip()
