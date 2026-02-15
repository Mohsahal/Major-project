# Flask API – Project Structure

```
flask/
├── app.py              # Entry point: creates Flask app, CORS, registers blueprints
├── config.py           # Environment config (API keys, port, CORS)
├── services.py         # Lazy singletons: get_skill_analyzer(), get_job_recommender()
├── skill_gap_analyzer.py   # Re-exports SkillGapAnalyzer from skill_gap/ (entry point)
│
├── skill_gap/          # Skill gap analysis (resume vs job description)
│   ├── __init__.py     # Exports SkillGapAnalyzer
│   ├── analyzer.py     # Main AI + fallback logic
│   ├── skills_extractor.py   # Regex-based skill extraction
│   ├── youtube_client.py     # YouTube learning videos
│   └── learning.py     # Learning recommendations
│
├── job_recommender/    # Job recommendations (resume → jobs)
│   ├── __init__.py     # Exports JobRecommender
│   ├── data_loader.py  # Load linkedin + naukri JSON
│   ├── preprocessing.py     # Clean descriptions, extract skills
│   ├── resume_analyzer.py   # Parse resume (skills, experience)
│   ├── similarity.py   # TF-IDF + embeddings scoring
│   ├── formatters.py   # Format API responses
│   └── models.py       # Model cache (TF-IDF, embeddings)
│
├── routes/             # API endpoints
│   ├── health.py       # GET /health
│   ├── jobs.py         # POST /upload-resume, /recommend-jobs, GET /jobs-stats, /all-jobs
│   └── skill_gap.py    # POST /skill-gap-analysis
│
└── utils/
    └── resume_parser.py    # Extract text from PDF/DOCX/TXT
```

## Flow

1. **app.py** – Loads config, CORS, registers route blueprints.
2. **routes/** – Handle HTTP, call **services** for business logic.
3. **services.py** – Lazy-loads **skill_gap** or **job_recommender** on first use.
4. **skill_gap/** – Skill gap AI + fallback + learning resources.
5. **job_recommender/** – Load jobs, score with TF-IDF + embeddings, return matches.
