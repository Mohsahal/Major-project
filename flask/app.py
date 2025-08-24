#!/usr/bin/env python3
"""
Clean Job Recommender System - AI-powered resume analysis and job matching.
"""

import os
import sys
import argparse
import docx2txt
import PyPDF2
import requests
import pandas as pd
# Remove global import of sentence_transformers
# from sentence_transformers import SentenceTransformer, util

from config import SERPAPI_API_KEY, DEFAULT_LOCATION, DEFAULT_TOP_RESULTS, DEFAULT_MODEL

# Global variable to store the model instance
_sentence_model = None
_sentence_util = None

def get_sentence_model():
    """Lazy load the SentenceTransformer model only when needed."""
    global _sentence_model, _sentence_util
    
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer, util
            _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
            _sentence_util = util
            print("SentenceTransformer model loaded successfully")
        except ImportError as e:
            print(f"Error importing sentence_transformers: {e}")
            raise ImportError("sentence_transformers not installed. Please install with: pip install sentence-transformers")
        except Exception as e:
            print(f"Error loading SentenceTransformer model: {e}")
            raise
    
    return _sentence_model, _sentence_util

def extract_resume_text(resume_path: str) -> str:
    """Extract text from resume file."""
    if resume_path.endswith(".pdf"):
        text = ""
        with open(resume_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text
    elif resume_path.endswith(".docx"):
        return docx2txt.process(resume_path)
    elif resume_path.endswith(".txt"):
        with open(resume_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        raise ValueError("Unsupported resume format. Use PDF, DOCX, or TXT.")

def generate_smart_query(resume_analysis: dict, location: str = "Bangalore") -> str:
    """Generate optimized job search queries."""
    primary_domain = resume_analysis["primary_domain"]
    subdomain = resume_analysis.get("subdomain", "")
    primary_data = resume_analysis["all_domains"][primary_domain]
    
    if primary_domain == "javascript_fullstack":
        frameworks = primary_data["framework_matches"][:3]
        if subdomain == "full_stack":
            return f"Full Stack Developer {' '.join(frameworks)} {location} jobs"
        elif subdomain == "frontend":
            return f"Frontend Developer {' '.join(frameworks)} {location} jobs"
        else:
            return f"JavaScript Developer {' '.join(frameworks)} {location} jobs"
    elif primary_domain == "python_development":
        frameworks = primary_data["framework_matches"][:2]
        if subdomain == "django_developer":
            return f"Django Developer Python {location} jobs"
        else:
            return f"Python Developer {' '.join(frameworks)} {location} jobs"
    elif primary_domain == "cybersecurity":
        return f"Cybersecurity Engineer {location} jobs"
    elif primary_domain == "data_science":
        return f"Data Scientist {location} jobs"
    elif primary_domain == "devops":
        return f"DevOps Engineer {location} jobs"
    else:
        return f"Software Developer {location} jobs"

def fetch_jobs_from_serpapi(query: str, api_key: str):
    """Fetch jobs from SerpApi Google Jobs."""
    url = "https://serpapi.com/search"
    params = {"engine": "google_jobs", "q": query, "api_key": api_key}
    resp = requests.get(url, params=params)

    if resp.status_code != 200:
        print("SerpApi Error:", resp.text)
        return []

    data = resp.json()
    return data.get("jobs_results", [])

def rank_jobs_domain_aware(resume_text, jobs, resume_analysis, model_name="all-MiniLM-L6-v2"):
    """Rank jobs by similarity using domain-aware scoring."""
    # Load model only when this function is called
    model, util = get_sentence_model()
    
    resume_emb = model.encode(resume_text, convert_to_tensor=True)

    ranked = []
    primary_domain = resume_analysis["primary_domain"]
    subdomain = resume_analysis.get("subdomain", "")
    
    for job in jobs:
        job_text = f"{job.get('title','')} {job.get('company_name','')} {job.get('description','')}"
        job_emb = model.encode(job_text, convert_to_tensor=True)
        base_sim = util.cos_sim(resume_emb, job_emb).item()
        
        # Simple domain boost
        domain_boost = 0.1 if primary_domain.lower() in job_text.lower() else 0.0
        
        final_similarity = min(base_sim + domain_boost, 1.0)
        
        job["similarity"] = final_similarity
        job["base_similarity"] = base_sim
        job["domain_boost"] = domain_boost
        job["primary_domain"] = primary_domain
        job["subdomain"] = subdomain
        ranked.append(job)

    ranked.sort(key=lambda x: x["similarity"], reverse=True)
    return ranked

def save_to_csv(jobs, out_file):
    """Save job recommendations to CSV file."""
    csv_data = []
    for job in jobs:
        csv_data.append({
            "Title": job.get("title", ""),
            "Company": job.get("company_name", ""),
            "Location": job.get("location", ""),
            "Source": job.get("via", ""),
            "Match %": round(job.get("similarity", 0.0) * 100, 2),
            "Apply Link": job.get("share_link") or job.get("link") or ""
        })
    
    df = pd.DataFrame(csv_data)
    df.to_csv(out_file, index=False)
    return df

def analyze_resume_type(resume_text: str) -> dict:
    """Analyze resume to detect domain focus."""
    
    domain_keywords = {
        "javascript_fullstack": {
            "keywords": ["javascript", "js", "react", "angular", "vue", "node.js", "express", "full stack", "frontend", "backend"],
            "tools": ["npm", "webpack", "babel", "eslint", "jest"],
            "frameworks": ["react", "angular", "vue", "express", "next.js"],
            "databases": ["mongodb", "mysql", "postgresql", "firebase"],
            "cloud": ["aws", "vercel", "netlify", "heroku"]
        },
        "python_development": {
            "keywords": ["python", "django", "flask", "fastapi", "backend developer", "api developer"],
            "tools": ["pip", "virtualenv", "pytest", "celery"],
            "frameworks": ["django", "flask", "fastapi", "pyramid"],
            "databases": ["postgresql", "mysql", "sqlite", "mongodb"],
            "cloud": ["aws", "azure", "gcp", "heroku"]
        },
        "cybersecurity": {
            "keywords": ["security", "cybersecurity", "penetration", "ethical hacker", "vulnerability", "threat"],
            "tools": ["wireshark", "nmap", "metasploit", "burp suite", "kali linux"],
            "frameworks": ["owasp", "nist", "iso 27001"],
            "databases": ["splunk", "elk", "qradar"],
            "cloud": ["aws security", "azure defender", "gcp security"]
        },
        "data_science": {
            "keywords": ["data scientist", "machine learning", "ml", "ai", "statistics", "analytics"],
            "tools": ["jupyter", "pandas", "numpy", "scikit-learn", "tensorflow"],
            "frameworks": ["scikit-learn", "tensorflow", "pytorch", "keras"],
            "databases": ["postgresql", "mysql", "mongodb", "hadoop"],
            "cloud": ["aws", "azure", "gcp", "databricks"]
        },
        "devops": {
            "keywords": ["devops", "ci/cd", "infrastructure", "automation", "monitoring"],
            "tools": ["docker", "kubernetes", "jenkins", "terraform", "ansible"],
            "frameworks": ["kubernetes", "docker swarm", "jenkins"],
            "databases": ["prometheus", "grafana", "elk"],
            "cloud": ["aws", "azure", "gcp", "digitalocean"]
        }
    }
    
    domain_scores = {}
    for domain, data in domain_keywords.items():
        keyword_matches = [kw for kw in data["keywords"] if kw.lower() in resume_text.lower()]
        tool_matches = [tool for tool in data["tools"] if tool.lower() in resume_text.lower()]
        framework_matches = [fw for fw in data["frameworks"] if fw.lower() in resume_text.lower()]
        database_matches = [db for db in data["databases"] if db.lower() in resume_text.lower()]
        cloud_matches = [cloud for cloud in data["cloud"] if cloud.lower() in resume_text.lower()]
        
        keyword_score = len(keyword_matches) / len(data["keywords"]) * 50
        tool_score = len(tool_matches) / len(data["tools"]) * 20
        framework_score = len(framework_matches) / len(data["frameworks"]) * 20
        database_score = len(database_matches) / len(data["databases"]) * 7
        cloud_score = len(cloud_matches) / len(data["cloud"]) * 3
        
        total_score = keyword_score + tool_score + framework_score + database_score + cloud_score
        
        domain_scores[domain] = {
            "score": round(total_score, 1),
            "keyword_matches": keyword_matches,
            "tool_matches": tool_matches,
            "framework_matches": framework_matches,
            "database_matches": database_matches,
            "cloud_matches": cloud_matches
        }
    
    primary_domain = max(domain_scores.items(), key=lambda x: x[1]["score"])
    top_domains = sorted(domain_scores.items(), key=lambda x: x[1]["score"], reverse=True)[:3]
    subdomain = detect_subdomain(resume_text, primary_domain[0])
    
    return {
        "primary_domain": primary_domain[0],
        "primary_score": primary_domain[1]["score"],
        "subdomain": subdomain,
        "all_domains": domain_scores,
        "top_domains": top_domains,
        "resume_text_length": len(resume_text)
    }

def detect_subdomain(resume_text: str, primary_domain: str) -> str:
    """Detect specific subdomain within the primary domain."""
    resume_lower = resume_text.lower()
    
    if primary_domain == "javascript_fullstack":
        if "frontend" in resume_lower and "backend" in resume_lower:
            return "full_stack"
        elif "frontend" in resume_lower:
            return "frontend"
        elif "backend" in resume_lower:
            return "backend"
        else:
            return "javascript_developer"
    elif primary_domain == "python_development":
        if "django" in resume_lower:
            return "django_developer"
        elif "flask" in resume_lower:
            return "flask_developer"
        else:
            return "python_developer"
    elif primary_domain == "cybersecurity":
        if "penetration" in resume_lower:
            return "penetration_tester"
        else:
            return "security_analyst"
    elif primary_domain == "data_science":
        if "machine learning" in resume_lower:
            return "ml_engineer"
        else:
            return "data_scientist"
    elif primary_domain == "devops":
        if "ci/cd" in resume_lower:
            return "ci_cd_engineer"
        else:
            return "devops_engineer"
    
    return "general"

def main():
    """Main CLI function."""
    parser = argparse.ArgumentParser(description="AI Job Recommender")
    parser.add_argument("--resume", required=True, help="Path to resume file")
    parser.add_argument("--api-key", default=SERPAPI_API_KEY, help="SerpApi API key")
    parser.add_argument("--top", type=int, default=DEFAULT_TOP_RESULTS, help="Number of top jobs")
    parser.add_argument("--out", default="job_recommendations.csv", help="CSV output path")
    parser.add_argument("--location", default=DEFAULT_LOCATION, help="Job location")
    args = parser.parse_args()

    if not args.api_key:
        print("ERROR: Provide SerpApi API key", file=sys.stderr)
        sys.exit(1)

    resume_text = extract_resume_text(args.resume)
    resume_analysis = analyze_resume_type(resume_text)
    auto_query = generate_smart_query(resume_analysis, location=args.location)
    
    jobs = fetch_jobs_from_serpapi(auto_query, args.api_key)
    if not jobs:
        print("No jobs found.", file=sys.stderr)
        sys.exit(0)

    ranked = rank_jobs_domain_aware(resume_text, jobs, resume_analysis)
    top_n = ranked[:args.top]
    
    for i, j in enumerate(top_n, 1):
        print(f"{i}. {j.get('title','')} - {j.get('company_name','')}")
        print(f"   📍 {j.get('location','')} | Match: {round(j.get('similarity', 0.0) * 100, 2)}%")
        print(f"   🔗 Apply: {j.get('share_link') or j.get('link') or ''}")
        print()

    save_to_csv(top_n, args.out)
    print(f"💾 Saved to: {args.out}")

if __name__ == "__main__":
    main()
