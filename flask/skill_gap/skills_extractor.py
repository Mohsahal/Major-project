"""Regex-based skill extraction from text."""
import re
from typing import List, Dict

SKILLS_PATTERNS = {
    "security": r"\bsecurity\b",
    "monitoring": r"\bmonitoring\b",
    "detection": r"\bdetection\b",
    "investigation": r"\binvestigation\b",
    "response": r"\bresponse\b",
    "analysis": r"\banalysis\b",
    "risk assessment": r"\brisk assessment\b",
    "threat detection": r"\bthreat detection\b",
    "vulnerability management": r"\bvulnerability management\b",
    "security monitoring": r"\bsecurity monitoring\b",
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
    "mysql": r"\bmysql\b",
    "postgresql": r"\b(?:postgresql|postgres)\b",
    "mongodb": r"\bmongodb\b",
    "redis": r"\bredis\b",
    "sqlite": r"\bsqlite\b",
    "oracle": r"\boracle\b",
    "sql server": r"\bsql server\b",
    "cassandra": r"\bcassandra\b",
    "dynamodb": r"\bdynamodb\b",
    "aws": r"\b(?:aws|amazon web services)\b",
    "azure": r"\b(?:azure|microsoft azure)\b",
    "gcp": r"\b(?:gcp|google cloud|google cloud platform)\b",
    "heroku": r"\bheroku\b",
    "digitalocean": r"\bdigitalocean\b",
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
    "html": r"\bhtml\b",
    "css": r"\bcss\b",
    "http": r"\bhttp\b",
    "rest": r"\brest\b",
    "graphql": r"\bgraphql\b",
    "soap": r"\bsoap\b",
    "websocket": r"\bwebsocket\b",
    "agile": r"\bagile\b",
    "scrum": r"\bscrum\b",
    "kanban": r"\bkanban\b",
    "devops": r"\bdevops\b",
    "ci/cd": r"\b(?:ci/cd|continuous integration|continuous deployment)\b",
    "tdd": r"\b(?:tdd|test driven development)\b",
    "bdd": r"\b(?:bdd|behavior driven development)\b",
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
    "apache": r"\bapache\b",
    "cybersecurity": r"\b(?:cybersecurity|cyber security|cyber-security)\b",
    "information security": r"\b(?:information security|infosec)\b",
    "network security": r"\bnetwork security\b",
    "penetration testing": r"\b(?:penetration testing|pen testing|pentesting)\b",
    "vulnerability assessment": r"\bvulnerability assessment\b",
    "siem": r"\bsiem\b",
    "splunk": r"\bsplunk\b",
    "wireshark": r"\bwireshark\b",
    "metasploit": r"\bmetasploit\b",
    "nmap": r"\bnmap\b",
    "burp suite": r"\b(?:burp suite|burpsuite)\b",
    "owasp": r"\bowasp\b",
    "firewall": r"\bfirewall\b",
    "ids": r"\b(?:ids|intrusion detection system)\b",
    "ips": r"\b(?:ips|intrusion prevention system)\b",
    "vpn": r"\bvpn\b",
    "encryption": r"\bencryption\b",
    "ssl": r"\b(?:ssl|tls)\b",
    "pki": r"\bpki\b",
    "iam": r"\b(?:iam|identity and access management)\b",
    "soc": r"\b(?:soc|security operations center)\b",
    "incident response": r"\bincident response\b",
    "threat intelligence": r"\bthreat intelligence\b",
    "malware analysis": r"\bmalware analysis\b",
    "forensics": r"\b(?:forensics|digital forensics)\b",
    "compliance": r"\bcompliance\b",
    "gdpr": r"\bgdpr\b",
    "hipaa": r"\bhipaa\b",
    "pci dss": r"\b(?:pci dss|pci-dss)\b",
    "iso 27001": r"\biso 27001\b",
    "kali linux": r"\b(?:kali linux|kali)\b",
    "nessus": r"\bnessus\b",
    "qualys": r"\bqualys\b",
    "rapid7": r"\brapid7\b",
    "crowdstrike": r"\bcrowdstrike\b",
    "sentinel": r"\bsentinel\b",
    "carbon black": r"\bcarbon black\b",
    "palo alto": r"\b(?:palo alto|paloalto)\b",
    "checkpoint": r"\bcheckpoint\b",
    "fortinet": r"\bfortinet\b",
    "sql": r"\b(?:sql|structured query language)\b",
    "nosql": r"\b(?:nosql|no sql)\b",
    "api": r"\b(?:api|application programming interface)\b",
    "microservices": r"\bmicroservices\b",
    "gitlab ci": r"\b(?:gitlab ci|gitlab-ci)\b",
    "github actions": r"\bgithub actions\b",
    "jira": r"\bjira\b",
    "confluence": r"\bconfluence\b",
    "slack": r"\bslack\b",
    "microsoft office": r"\b(?:microsoft office|ms office|office 365)\b",
    "excel": r"\bexcel\b",
    "powerpoint": r"\bpowerpoint\b",
    "word": r"\bword\b",
}


def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from text using regex patterns."""
    found = []
    text_lower = text.lower()
    for skill_name, pattern in SKILLS_PATTERNS.items():
        if re.search(pattern, text_lower):
            found.append(skill_name.title())
    return found


def extract_skills_fallback_improved(resume_text: str, job_description: str) -> Dict:
    """Fallback skill gap analysis using regex extraction."""
    job_skills = extract_skills_from_text(job_description)
    resume_skills = extract_skills_from_text(resume_text)
    job_norm = [s.lower().strip() for s in job_skills]
    resume_norm = [s.lower().strip() for s in resume_skills]

    present = [s for s in job_skills if s.lower().strip() in resume_norm]
    missing = [s for s in job_skills if s.lower().strip() not in resume_norm]
    additional = [s for s in resume_skills if s.lower().strip() not in job_norm]
    high_skills = ["python", "javascript", "react", "java", "aws", "docker", "cybersecurity", "network security"]
    skill_analysis = {}
    for s in present:
        skill_analysis[s] = {"status": "present", "importance": "high" if s.lower() in high_skills else "medium", "level": "intermediate"}
    for s in missing:
        skill_analysis[s] = {"status": "missing", "importance": "high" if s.lower() in high_skills else "medium", "level": "basic"}
    for s in additional:
        skill_analysis[s] = {"status": "additional", "importance": "medium", "level": "intermediate"}

    return {
        "present_skills": present,
        "missing_skills": missing,
        "additional_skills": additional,
        "skill_analysis": skill_analysis,
    }
