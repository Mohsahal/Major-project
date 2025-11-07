#!/usr/bin/env python3
"""
Clean Job Recommender System - AI-powered resume analysis and job matching.
"""

import os
import sys
import re
import uuid
import json
import argparse
import docx2txt
import PyPDF2
import requests
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from typing import List, Dict, Any, Optional

from config import SERPAPI_API_KEY, DEFAULT_LOCATION, DEFAULT_TOP_RESULTS, DEFAULT_MODEL

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

def fetch_jobs_from_serpapi(query: str, api_key: str, max_jobs: int = 100):
    """Fetch all jobs from Google Jobs with enhanced pagination.
    
    Args:
        query: Search query string
        api_key: SerpAPI key
        max_jobs: Maximum number of jobs to fetch (default: 100)
    """
    url = "https://serpapi.com/search"
    all_jobs = []
    start = 0
    max_attempts = 10  # Reduced to avoid too many API calls
    attempts = 0
    seen_job_hashes = set()
    
    # Completely clean the query - remove all filters and special parameters
    query = re.sub(r'\b(?:site|source|exp|experience|level|salary|pay|compensation|type|location|filter):\S+', '', query, flags=re.IGNORECASE).strip()
    query = re.sub(r'\b(?:intitle|inurl|intext):\S+', '', query, flags=re.IGNORECASE).strip()
    
    # Remove all job-related filters and qualifiers
    filter_terms = [
        # Experience levels
        'entry[- ]?level', 'junior', 'senior', 'lead', 'principal',
        'experience', 'exp:', 'level:', 'years?', 'yrs?',
        '\d+[+\-]?\d*\s*(?:years?|yrs?)(?:\s*\+?\s*\w+)?',
        
        # Job types
        'full[- ]?time', 'part[- ]?time', 'contract', 'freelance', 'internship',
        'temporary', 'temp', 'permanent', 'remote', 'work from home', 'wfh',
        'hybrid', 'on[- ]?site', 'onsite', 'office',
        
        # Salary and compensation
        'salary', 'pay', 'compensation', 'stipend', 'rate',
        '\$\d+[kK](?:\s*[\-–]\s*\$?\d+[kK])?',
        '\d+\s*(?:k|k\+?|K|K\+?)(?:\s*[\-–]\s*\d+\s*(?:k|k\+?|K|K\+?))?',
        
        # Other common filters
        'urgent', 'hiring', 'immediate', 'priority', 'high priority',
        'bachelor', 'master', 'phd', 'degree', 'diploma', 'certification'
    ]
    
    for term in filter_terms:
        query = re.sub(term, '', query, flags=re.IGNORECASE)
    
    # Clean up the query
    query = ' '.join(query.split())  # Remove extra spaces
    query = re.sub(r'\s*[\-\|\/]\s*', ' ', query)  # Remove separators
    query = query.strip()
    
    # Ensure we have a basic job search query
    if not any(term in query.lower() for term in ['job', 'career', 'position', 'opening', 'role']):
        query = f"{query} jobs" if query else "jobs"
    
    print(f"🔎 Search query: {query}")
    
    while len(all_jobs) < max_jobs and attempts < max_attempts:
        # Fetch jobs with pagination
        # Minimal parameters for broadest possible job search
        params = {
            "engine": "google_jobs",
            "q": query,
            "api_key": api_key,
            "start": start,
            "hl": "en",
            "gl": "us",
            "num": 20,  # Maximum results per page
            "filter": 0,  # Disable all filters
            "chips": "",  # Clear any job type filters
            "ibp": "htl;jobs",  # Job search mode
            "source": "hp",  # Get jobs from all sources
            "no_cache": "true",  # Get fresh results
            "tbs": "qdr:y",  # Jobs from last year (wider range)
            "sort": "date"  # Sort by most recent
        }
        
        # Remove any experience-related parameters
        if 'exp:' in query.lower():
            query = re.sub(r'\bexp:\S+', '', query, flags=re.IGNORECASE).strip()
        
        try:
            print(f"Fetching jobs page {attempts + 1}...")
            resp = requests.get(url, params=params, timeout=30)
            
            if resp.status_code != 200:
                print(f"SerpApi Error (status {resp.status_code}):", resp.text)
                break
                
            data = resp.json()
            jobs_batch = data.get("jobs_results", [])
            
            if not jobs_batch:
                print("No more jobs found.")
                break
            
            # Add all jobs, only filter out exact duplicates
            new_jobs = []
            for job in jobs_batch:
                # Get job details
                job_id = job.get('job_id', str(uuid.uuid4()))  # Generate ID if missing
                title = job.get('title', '').lower().strip()
                company = job.get('company_name', '').lower().strip()
                
                # Skip jobs with missing critical information
                if not title or not company:
                    continue
                
                # Create a unique hash
                job_hash = f"{title}:{company}"
                
                if job_hash not in seen_job_hashes:
                    seen_job_hashes.add(job_hash)
                    
                    # Ensure we have a valid apply link
                    if not job.get('related_links') and not job.get('via'):
                        job['via'] = 'Direct Employer'  # Default source
                        
                    new_jobs.append(job)
            
            if new_jobs:
                all_jobs.extend(new_jobs)
                print(f"✅ Page {attempts + 1}: Added {len(new_jobs)} new jobs (Total: {len(all_jobs)})")
            else:
                print(f"ℹ️  Page {attempts + 1}: No new jobs found")
            
            # Add a small delay to avoid rate limiting
            import time
            time.sleep(1.5)  # Slightly longer delay to be safe
            
            # Check if we've reached the desired number of jobs or no more results
            if len(all_jobs) >= max_jobs or 'serpapi_pagination' not in data:
                break
                
            # Get next page token if available
            if 'serpapi_pagination' in data and 'next' in data['serpapi_pagination']:
                next_page = data['serpapi_pagination'].get('next')
                if next_page and next_page != '2':  # Avoid infinite loops
                    start = data['serpapi_pagination'].get('current', 0) * 10
                    print(f"↪️  Fetching next page of results... (Start: {start})")
                else:
                    print("ℹ️  No more pages available")
                    break
            else:
                print("ℹ️  No pagination information found")
                break
                
            attempts += 1
            
        except Exception as e:
            print(f"Error fetching jobs: {str(e)}")
            break
    
    # Prepare the final list of jobs
    jobs_to_return = all_jobs[:max_jobs]
    
    # Analyze job sources - ensure we're getting all sources
    sources = {}
    for job in jobs_to_return:
        # Get the source, default to 'Direct Employer' if not specified
        source = job.get('via', 'Direct Employer')
        
        # Clean up source names
        if isinstance(source, str):
            source = source.replace('via ', '').strip()
            if not source or source.lower() in ['via', '']:
                source = 'Direct Employer'
        else:
            source = 'Direct Employer'
        
        # Keep the original source name instead of normalizing to track all sources
        # This will help us see all unique sources
            
        sources[source] = sources.get(source, 0) + 1
    
    # Print detailed source information
    print("\n📊 Job Sources Summary (showing all unique sources):")
    if not sources:
        print("⚠️ No job sources found - check API response format")
    else:
        # Show all unique sources, sorted by count
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            print(f"- {source}: {count} jobs")
        
        # Show a warning if we're only getting one source
        if len(sources) == 1:
            print("\n⚠️ Only one source detected. The API might be limiting results.")
            print("   Try adjusting the search query or location for more diverse results.")
    
    print(f"\n✅ Found {len(jobs_to_return)} unique jobs matching: '{query}'")
    
    return jobs_to_return

def rank_jobs_domain_aware(resume_text, jobs, resume_analysis, model_name="all-MiniLM-L6-v2"):
    """Rank jobs by similarity using domain-aware scoring."""
    model = SentenceTransformer(model_name)
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
    parser.add_argument("--top", type=int, default=50, help="Number of top jobs to display (default: 50)")
    parser.add_argument("--fetch", type=int, default=100, help="Maximum number of jobs to fetch (default: 100)")
    parser.add_argument("--out", default="job_recommendations.csv", help="CSV output path")
    parser.add_argument("--location", default=DEFAULT_LOCATION, help="Job location")
    args = parser.parse_args()

    if not args.api_key:
        print("ERROR: Provide SerpApi API key", file=sys.stderr)
        sys.exit(1)

    print(f"🔍 Analyzing resume and finding matching jobs...\n")
    resume_text = extract_resume_text(args.resume)
    resume_analysis = analyze_resume_type(resume_text)
    auto_query = generate_smart_query(resume_analysis, location=args.location)
    
    print(f"🌐 Searching for jobs with query: '{auto_query}'")
    jobs = fetch_jobs_from_serpapi(auto_query, args.api_key, max_jobs=args.fetch)
    
    if not jobs:
        print("❌ No jobs found. Try a different search query or location.", file=sys.stderr)
        sys.exit(0)

    print(f"\n✨ Found {len(jobs)} jobs. Analyzing best matches...")
    ranked = rank_jobs_domain_aware(resume_text, jobs, resume_analysis)
    
    # Sort by similarity score in descending order
    ranked.sort(key=lambda x: x.get('similarity', 0), reverse=True)
    
    # Get top N jobs to display
    top_n = ranked[:args.top]
    
    # Print job recommendations
    print(f"\n🎯 Top {len(top_n)} Job Recommendations (showing best matches first):\n")
    
    for i, job in enumerate(top_n, 1):
        title = job.get('title', 'No Title')
        company = job.get('company_name', 'Unknown Company')
        location = job.get('location', 'Location not specified')
        similarity = round(job.get('similarity', 0.0) * 100, 1)
        apply_link = job.get('share_link') or job.get('link') or 'No link available'
        
        # Add emoji based on match score
        match_emoji = "⭐" * min(5, int(similarity // 20) + 1)
        
        print(f"{i}. {title} - {company}")
        print(f"   📍 {location}")
        print(f"   {match_emoji} Match: {similarity}%")
        print(f"   🔗 Apply: {apply_link}")
        
        # Show job description snippet if available
        if 'description' in job and job['description']:
            desc = job['description'][:150] + '...' if len(job['description']) > 150 else job['description']
            print(f"   📝 {desc}")
        print()

    # Save all ranked jobs to CSV, not just the displayed ones
    save_to_csv(ranked, args.out)
    print(f"\n💾 Saved {len(ranked)} job recommendations to {args.out}")
    print(f"💾 Saved to: {args.out}")

if __name__ == "__main__":
    main()
