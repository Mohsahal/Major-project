#!/usr/bin/env python3
"""
ATS Resume Scorer
-----------------
A pragmatic scoring pipeline that estimates how well a resume matches a job description.

It combines:
1) Keyword coverage (from TF‑IDF of the job description)
2) Semantic similarity (SentenceTransformers, if available)
3) Experience alignment (years required vs. estimated years in resume)
4) Education match (degree level alignment)
5) ATS-friendliness heuristics (formatting flags)

Output: A 0–100 score + a transparent breakdown.

Usage
-----
python ats_scorer.py --resume RESUME_PATH_OR_TEXT --job JOB_PATH_OR_TEXT \
    [--resume-is-text] [--job-is-text] [--max-keywords 40]

Examples
--------
python ats_scorer.py --resume resume.pdf --job jd.txt
python ats_scorer.py --resume "...paste resume text..." --job "...paste JD text..." --resume-is-text --job-is-text

Dependencies
------------
Python 3.9+
pip install scikit-learn sentence-transformers rapidfuzz PyPDF2 docx2txt
(If SentenceTransformers is missing, the script will reweight the score.)

Notes
-----
This is a *heuristic* scorer to help iterate on your resume. Actual ATS and recruiter judgment vary.
"""
from __future__ import annotations
import argparse
import math
import os
import re
import sys
from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict

# Optional imports (we handle absence gracefully)
try:
    from sentence_transformers import SentenceTransformer, util as st_util  # type: ignore
    _HAS_ST = True
except Exception:
    _HAS_ST = False

try:
    from rapidfuzz import fuzz  # type: ignore
    _HAS_FUZZ = True
except Exception:
    _HAS_FUZZ = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
    from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
    _HAS_SK = True
except Exception:
    _HAS_SK = False

# For reading common formats
try:
    import docx2txt  # type: ignore
except Exception:
    docx2txt = None

try:
    import PyPDF2  # type: ignore
except Exception:
    PyPDF2 = None

STOPWORDS = set(
    """
a about above after again against all am an and any are aren't as at be because been before being below
between both but by can't cannot could couldn't did didn't do does doesn't doing don't down during each few
for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself
him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most
mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same
shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves
then there there's these they they'd they'll they're they've this those through to too under until up very was
wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's whom
why why's with won't would wouldn't you you'd you'll you're you've your yours yourself yourselves
""".split()
)

DEGREE_LEVELS = [
    ("phd", 4), ("doctor of philosophy", 4), ("doctorate", 4),
    ("masters", 3), ("master's", 3), ("ms", 3), ("m.s.", 3), ("mtech", 3), ("m.tech", 3), ("msc", 3), ("m.sc", 3),
    ("bachelors", 2), ("bachelor's", 2), ("bs", 2), ("b.s.", 2), ("btech", 2), ("b.tech", 2), ("be", 2), ("b.e.", 2),
    ("diploma", 1), ("associate", 1)
]

@dataclass
class ScoreBreakdown:
    keyword_coverage: float
    semantic_similarity: Optional[float]
    experience_alignment: float
    education_alignment: float
    ats_friendly: float
    details: Dict[str, object]

    def total(self, has_semantic: bool) -> float:
        # Base weights
        # If semantic is available: 25 keyword + 25 semantic + 20 exp + 10 edu + 20 ats = 100
        # If not: 45 keyword + 25 exp + 10 edu + 20 ats = 100
        if has_semantic:
            return (
                0.25 * self.keyword_coverage +
                0.25 * (self.semantic_similarity or 0.0) +
                0.20 * self.experience_alignment +
                0.10 * self.education_alignment +
                0.20 * self.ats_friendly
            ) * 100
        else:
            return (
                0.45 * self.keyword_coverage +
                0.25 * self.experience_alignment +
                0.10 * self.education_alignment +
                0.20 * self.ats_friendly
            ) * 100

# ----------------------------- Utility Functions ----------------------------- #

def _norm(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def tokenize(text: str) -> List[str]:
    text = _norm(text)
    # keep letters, numbers, +, #, and dots (for skills like c++, .net)
    text = re.sub(r"[^a-z0-9\+\#\. ]+", " ", text)
    tokens = [t for t in text.split() if t and t not in STOPWORDS]
    return tokens

# ---------------------------- Loaders & Parsers ------------------------------ #

def load_text(path_or_text: str, *, is_text: bool = False) -> str:
    if is_text:
        return path_or_text
    path = path_or_text
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    ext = os.path.splitext(path)[1].lower()
    if ext in {".txt", ".md"}:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    if ext in {".docx"}:
        if docx2txt is None:
            raise RuntimeError("docx2txt is required to read .docx files. pip install docx2txt")
        return docx2txt.process(path) or ""
    if ext in {".pdf"}:
        if PyPDF2 is None:
            raise RuntimeError("PyPDF2 is required to read PDFs. pip install PyPDF2")
        text_parts = []
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
        return "\n".join(text_parts)
    # Fallback: try reading as text
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

# ----------------------- Feature Extraction Functions ----------------------- #

def extract_required_years(job_text: str) -> Optional[int]:
    txt = _norm(job_text)
    # match like "3+ years", "at least 5 years", "5 years of experience"
    patterns = [
        r"(\d{1,2})\s*\+\s*years",
        r"at least\s*(\d{1,2})\s*years",
        r"minimum\s*(\d{1,2})\s*years",
        r"(\d{1,2})\s*years\s+(?:of\s+)?experience"
    ]
    years = []
    for p in patterns:
        for m in re.finditer(p, txt):
            years.append(int(m.group(1)))
    return max(years) if years else None

def estimate_resume_years(resume_text: str) -> Optional[float]:
    txt = _norm(resume_text)
    # heuristics: look for ranges like 2019-2023, 2020–24, "X years" claims
    year_spans = []
    for m in re.finditer(r"(20\d{2})\s*[–-]\s*(20\d{2})", txt):
        y1, y2 = int(m.group(1)), int(m.group(2))
        if y2 >= y1:
            year_spans.append(y2 - y1)
    claim_years = []
    for m in re.finditer(r"(\d{1,2})\s*\+?\s*years?\s+(?:of\s+)?experience", txt):
        claim_years.append(int(m.group(1)))
    # Combine signals: prefer claimed years if present, else sum spans capped
    if claim_years:
        return float(max(claim_years))
    if year_spans:
        # cap to avoid double counting overlapping roles
        total = sum(year_spans)
        return float(min(total, 20))
    return None

def extract_degree_level(text: str) -> int:
    t = _norm(text)
    best = 0
    for key, lvl in DEGREE_LEVELS:
        if key in t:
            best = max(best, lvl)
    return best  # 0 if none

def tfidf_top_keywords(job_text: str, max_keywords: int = 40) -> List[str]:
    if not _HAS_SK:
        # Very simple fallback: most frequent tokens
        tokens = tokenize(job_text)
        freq: Dict[str, int] = {}
        for tok in tokens:
            freq[tok] = freq.get(tok, 0) + 1
        return [w for w, _ in sorted(freq.items(), key=lambda x: (-x[1], x[0]))[:max_keywords]]
    # Use the job text as corpus with tokenized sentences + itself to stabilize TF-IDF
    sentences = re.split(r"[\.!?\n]", job_text)
    corpus = [job_text] + [s for s in sentences if s.strip()]
    vec = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2), max_features=1000)
    X = vec.fit_transform(corpus)
    # weights for the first doc (full JD)
    weights = X.toarray()[0]
    words = vec.get_feature_names_out()
    pairs = list(zip(words, weights))
    pairs.sort(key=lambda x: x[1], reverse=True)
    return [w for w, _ in pairs[:max_keywords]]

# ---------------------------- Scoring Components ---------------------------- #

def score_keyword_coverage(resume_text: str, keywords: List[str]) -> Tuple[float, Dict[str, object]]:
    res_toks = set(tokenize(resume_text))
    matched: List[str] = []
    missed: List[str] = []

    for kw in keywords:
        norm_kw = kw.lower().strip()
        norm_kw = re.sub(r"[^a-z0-9\+\#\. ]+", " ", norm_kw)
        tokens = [t for t in norm_kw.split() if t and t not in STOPWORDS]
        hit = False
        if len(tokens) == 1:
            # Exact token hit
            hit = tokens[0] in res_toks
            # Fuzzy fallback for near matches (e.g., docker vs. dockerized)
            if not hit and _HAS_FUZZ:
                for rt in res_toks:
                    if fuzz.partial_ratio(tokens[0], rt) >= 90:
                        hit = True
                        break
        else:
            # Phrase: check substring in normalized resume
            if " ".join(tokens) in " ".join(tokenize(resume_text)):
                hit = True
            elif _HAS_FUZZ:
                if fuzz.partial_ratio(" ".join(tokens), " ".join(tokenize(resume_text))) >= 90:
                    hit = True

        if hit:
            matched.append(kw)
        else:
            missed.append(kw)

    coverage = len(matched) / max(1, len(keywords))
    return coverage, {"matched_keywords": matched, "missed_keywords": missed}


def score_semantic_similarity(resume_text: str, job_text: str) -> Optional[float]:
    if not _HAS_ST:
        return None
    try:
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embs = model.encode([resume_text, job_text], normalize_embeddings=True, convert_to_tensor=True)
        sim = float(st_util.cos_sim(embs[0], embs[1]).cpu().numpy()[0][0])
        # Map cosine [-1,1] (close to [0,1] here) to [0,1]
        sim01 = (sim + 1) / 2.0
        return max(0.0, min(1.0, sim01))
    except Exception:
        return None


def score_experience_alignment(resume_text: str, job_text: str) -> Tuple[float, Dict[str, object]]:
    req = extract_required_years(job_text)
    have = estimate_resume_years(resume_text)
    if req is None and have is None:
        return 0.6, {"required_years": None, "estimated_years": None, "note": "No explicit years found; neutral-ish score."}
    if req is None and have is not None:
        # Reward having experience even if JD didn't specify
        s = min(1.0, have / 10.0)
        return s, {"required_years": None, "estimated_years": have}
    if req is not None and have is None:
        return 0.3, {"required_years": req, "estimated_years": None, "note": "Could not estimate resume experience."}
    # Both present
    assert req is not None and have is not None
    if have >= req:
        # full score with slight bonus up to +10% cap
        bonus = min(0.1, (have - req) * 0.02)
        return min(1.0, 0.9 + bonus), {"required_years": req, "estimated_years": have}
    # below requirement: linear scale
    return max(0.0, have / req), {"required_years": req, "estimated_years": have}


def score_education_alignment(resume_text: str, job_text: str) -> Tuple[float, Dict[str, object]]:
    req_lvl = extract_degree_level(job_text)
    have_lvl = extract_degree_level(resume_text)
    if req_lvl == 0 and have_lvl == 0:
        return 0.6, {"required_degree_level": 0, "resume_degree_level": 0, "note": "No degree info found; neutral-ish score."}
    if req_lvl == 0 and have_lvl > 0:
        return 0.9, {"required_degree_level": 0, "resume_degree_level": have_lvl}
    if req_lvl > 0 and have_lvl == 0:
        return 0.3, {"required_degree_level": req_lvl, "resume_degree_level": 0}
    # both present
    if have_lvl >= req_lvl:
        return 1.0, {"required_degree_level": req_lvl, "resume_degree_level": have_lvl}
    return 0.5, {"required_degree_level": req_lvl, "resume_degree_level": have_lvl}


def score_ats_friendly(resume_text: str, resume_source: str) -> Tuple[float, Dict[str, object]]:
    # Heuristics:
    # - Penalize if PDF text extraction seems empty or very low character/word ratio (could be image-based)
    # - Penalize heavy special characters, tables/columns
    txt = resume_text
    words = tokenize(txt)
    char_count = len(txt)
    word_count = max(1, len(words))
    avg_wlen = char_count / word_count

    ext = os.path.splitext(resume_source)[1].lower() if os.path.exists(resume_source) else ""
    ext_penalty = 0.0
    if ext not in {".txt", ".docx", "", ".md", ".rtf", ".pdf"}:
        ext_penalty = 0.1  # unknown extension

    # signs of columns/tables
    table_like = bool(re.search(r"\|\s*\|", txt)) or bool(re.search(r"\t{2,}", txt))
    bullet_density = len(re.findall(r"\n\s*[•\-\*]", txt)) / max(1, txt.count("\n"))

    score = 1.0
    details = {
        "char_count": char_count,
        "word_count": word_count,
        "avg_word_len": round(avg_wlen, 2),
        "table_like": table_like,
        "bullet_density": round(bullet_density, 3),
        "ext": ext or "(text input)",
    }

    if word_count < 150:
        score -= 0.2  # likely too short / extraction failed
    if avg_wlen > 8:
        score -= 0.1  # weird tokenization
    if table_like:
        score -= 0.1
    if bullet_density < 0.02:
        score -= 0.05  # not scannable
    if bullet_density > 0.25:
        score -= 0.05  # overly dense
    score -= ext_penalty

    return max(0.0, min(1.0, score)), details

# ------------------------------- Orchestration ------------------------------ #

def score_resume_against_job(resume_source: str, job_source: str, *, resume_is_text: bool=False, job_is_text: bool=False, max_keywords: int=40) -> ScoreBreakdown:
    resume_text = load_text(resume_source, is_text=resume_is_text)
    job_text = load_text(job_source, is_text=job_is_text)

    keywords = tfidf_top_keywords(job_text, max_keywords=max_keywords)
    kw_cov, kw_details = score_keyword_coverage(resume_text, keywords)

    sem = score_semantic_similarity(resume_text, job_text)

    exp_score, exp_details = score_experience_alignment(resume_text, job_text)
    edu_score, edu_details = score_education_alignment(resume_text, job_text)
    ats_score, ats_details = score_ats_friendly(resume_text, resume_source)

    details = {
        "keywords": keywords,
        "keyword_details": kw_details,
        "experience_details": exp_details,
        "education_details": edu_details,
        "ats_details": ats_details,
    }

    return ScoreBreakdown(
        keyword_coverage=kw_cov,
        semantic_similarity=sem,
        experience_alignment=exp_score,
        education_alignment=edu_score,
        ats_friendly=ats_score,
        details=details,
    )

# ----------------------------------- CLI ----------------------------------- #

def main():
    parser = argparse.ArgumentParser(description="ATS Resume Scorer")
    parser.add_argument("--resume", required=True, help="Resume file path or raw text")
    parser.add_argument("--job", required=True, help="Job description file path or raw text")
    parser.add_argument("--resume-is-text", action="store_true", help="Treat --resume as raw text rather than file path")
    parser.add_argument("--job-is-text", action="store_true", help="Treat --job as raw text rather than file path")
    parser.add_argument("--max-keywords", type=int, default=40, help="Max keywords extracted from JD (TF-IDF)")
    args = parser.parse_args()

    br = score_resume_against_job(
        args.resume, args.job,
        resume_is_text=args.resume_is_text,
        job_is_text=args.job_is_text,
        max_keywords=args.max_keywords,
    )

    has_sem = br.semantic_similarity is not None
    total = br.total(has_sem)

    print("\n================ ATS SCORE ================")
    print(f"Total Score: {total:.1f} / 100")
    print("------------------------------------------")
    print(f"Keyword Coverage: {br.keyword_coverage*100:.1f}/100")
    if has_sem:
        print(f"Semantic Similarity: {(br.semantic_similarity or 0)*100:.1f}/100")
    else:
        print("Semantic Similarity: N/A (install sentence-transformers for this)")
    print(f"Experience Alignment: {br.experience_alignment*100:.1f}/100")
    print(f"Education Alignment: {br.education_alignment*100:.1f}/100")
    print(f"ATS-Friendliness: {br.ats_friendly*100:.1f}/100")

    print("\n------------- Details & Tips --------------")
    # Keyword details
    kwd = br.details["keyword_details"]
    print(f"Top JD Keywords ({len(br.details['keywords'])}): {', '.join(br.details['keywords'])}")
    print(f"Matched ({len(kwd['matched_keywords'])}): {', '.join(kwd['matched_keywords'])}")
    print(f"Missed  ({len(kwd['missed_keywords'])}): {', '.join(kwd['missed_keywords'])}")

    # Experience
    print("\nExperience:")
    print(br.details["experience_details"])  # dict printed plainly

    # Education
    print("\nEducation:")
    print(br.details["education_details"])  # dict printed plainly

    # ATS heuristics
    print("\nATS Heuristics:")
    for k, v in br.details["ats_details"].items():
        print(f"  - {k}: {v}")

    # Suggestions
    print("\nSuggestions:")
    # Add suggestions based on missed keywords
    missed = kwd['missed_keywords']
    if missed:
        print("- Consider adding evidence for missing JD keywords (projects, bullet points):")
        print("  ", ", ".join(missed[:10]), ("..." if len(missed) > 10 else ""))
    # Experience tip
    exp = br.details["experience_details"]
    if (isinstance(exp.get("required_years"), int) and isinstance(exp.get("estimated_years"), (int, float))
        and exp["estimated_years"] < exp["required_years"]):
        print("- If you have relevant internships/part-time work, quantify them to reflect true experience.")
    # Education tip
    edu = br.details["education_details"]
    if edu.get("required_degree_level", 0) > edu.get("resume_degree_level", 0):
        print("- If you have an equivalent degree or ongoing program, make it explicit (e.g., 'Pursuing M.Tech (2026)').")
    # ATS tips
    ats = br.details["ats_details"]
    if ats["table_like"]:
        print("- Avoid multi-column tables; use simple bullet points.")
    if ats["bullet_density"] < 0.02:
        print("- Use clear, scannable bullets with achievements and metrics.")
    if ats["bullet_density"] > 0.25:
        print("- Reduce overly dense bullet lists; prioritize impact.")


if __name__ == "__main__":
    main()
