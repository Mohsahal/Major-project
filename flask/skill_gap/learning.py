"""Learning recommendations for missing skills."""
from typing import List, Dict

SKILL_CATEGORIES = {
    'python': {'type': 'programming_language', 'resources': ['Complete Python for Beginners course on Coursera or Udemy', 'Build 2-3 projects: web app, data analysis, automation script', 'Practice on LeetCode, HackerRank, or Codewars', 'Join Python Discord, Reddit r/learnpython', 'Read "Python Crash Course" or "Automate the Boring Stuff"'], 'estimated_time': '2-3 months', 'priority': 'high'},
    'javascript': {'type': 'programming_language', 'resources': ['Complete JavaScript fundamentals on freeCodeCamp or MDN', 'Build interactive web applications', 'Practice on JavaScript30 or Frontend Mentor', 'Join JavaScript communities', 'Read "Eloquent JavaScript"'], 'estimated_time': '2-4 months', 'priority': 'high'},
    'java': {'type': 'programming_language', 'resources': ['Complete Java Programming course on Coursera', 'Build desktop applications and Android apps', 'Practice on HackerRank Java challenges', 'Read "Head First Java" or "Effective Java"'], 'estimated_time': '3-4 months', 'priority': 'high'},
    'react': {'type': 'frontend_framework', 'resources': ['Complete React course on Scrimba or Udemy', 'Build portfolio website and e-commerce app', 'Practice with React challenges', 'Read "React Up & Running" or official React docs'], 'estimated_time': '2-3 months', 'priority': 'high'},
    'angular': {'type': 'frontend_framework', 'resources': ['Complete Angular course on Angular University', 'Build enterprise-level applications', 'Practice with Angular Material and RxJS'], 'estimated_time': '3-4 months', 'priority': 'medium'},
    'vue': {'type': 'frontend_framework', 'resources': ['Complete Vue.js course on Vue Mastery', 'Build single-page applications', 'Read "Vue.js in Action" or official Vue docs'], 'estimated_time': '2-3 months', 'priority': 'medium'},
    'node.js': {'type': 'backend_framework', 'resources': ['Complete Node.js course on freeCodeCamp', 'Build REST APIs and real-time applications', 'Practice with Express.js and MongoDB'], 'estimated_time': '2-3 months', 'priority': 'high'},
    'express': {'type': 'backend_framework', 'resources': ['Learn Express.js fundamentals and middleware', 'Build RESTful APIs', 'Read "Express in Action"'], 'estimated_time': '1-2 months', 'priority': 'medium'},
    'mongodb': {'type': 'database', 'resources': ['Complete MongoDB University free courses', 'Practice database design and CRUD', 'Read "MongoDB in Action"'], 'estimated_time': '1-2 months', 'priority': 'medium'},
    'mysql': {'type': 'database', 'resources': ['Complete MySQL course on Coursera or Udemy', 'Practice SQL queries', 'Read "MySQL Cookbook"'], 'estimated_time': '1-2 months', 'priority': 'medium'},
    'aws': {'type': 'cloud_platform', 'resources': ['Get AWS Certified Cloud Practitioner', 'Practice with AWS free tier', 'Deploy applications on EC2, S3, Lambda'], 'estimated_time': '3-6 months', 'priority': 'high'},
    'docker': {'type': 'devops_tool', 'resources': ['Complete Docker course on Docker Academy', 'Containerize applications', 'Read "Docker in Action"'], 'estimated_time': '1-2 months', 'priority': 'high'},
    'kubernetes': {'type': 'devops_tool', 'resources': ['Complete Kubernetes course', 'Practice with minikube and kubectl', 'Read "Kubernetes in Action"'], 'estimated_time': '2-4 months', 'priority': 'medium'},
    'agile': {'type': 'methodology', 'resources': ['Take Agile/Scrum certification', 'Practice in team projects', 'Use Jira, Trello, or Asana'], 'estimated_time': '1-2 months', 'priority': 'medium'},
    'devops': {'type': 'methodology', 'resources': ['Complete DevOps course', 'Practice CI/CD with Jenkins or GitHub Actions', 'Read "The Phoenix Project"'], 'estimated_time': '3-6 months', 'priority': 'high'},
}


def generate_learning_recommendations(missing_skills: List[str]) -> List[Dict]:
    """Generate learning recommendations for missing skills."""
    recommendations = []
    for skill in missing_skills:
        skill_lower = skill.lower()
        matched = None
        for key, data in SKILL_CATEGORIES.items():
            if key in skill_lower or skill_lower in key:
                matched = data
                break
        if matched:
            recommendations.append({
                'skill': skill,
                'type': matched['type'],
                'resources': matched['resources'],
                'estimated_time': matched['estimated_time'],
                'priority': matched['priority']
            })
        else:
            recommendations.append({
                'skill': skill,
                'type': 'general',
                'resources': [
                    f'Research {skill} fundamentals and best practices',
                    f'Find online courses for {skill} on Coursera, Udemy, or edX',
                    f'Practice {skill} in real-world projects',
                    f'Join {skill} communities and professional networks',
                ],
                'estimated_time': '2-4 months',
                'priority': 'medium'
            })
    return recommendations
