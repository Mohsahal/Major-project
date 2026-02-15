"""Similarity calculations and score combination."""
import logging
from typing import List, Tuple, Dict

logger = logging.getLogger(__name__)


def calculate_tfidf_similarity(tfidf_vectorizer, tfidf_matrix, resume_text: str, top_k: int = 50) -> List[Tuple[int, float]]:
    """Calculate TF-IDF similarity scores."""
    if tfidf_vectorizer is None or tfidf_matrix is None:
        return []
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        resume_vector = tfidf_vectorizer.transform([resume_text])
        similarities = cosine_similarity(resume_vector, tfidf_matrix).flatten()
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [(int(idx), float(similarities[idx])) for idx in top_indices]
    except Exception as e:
        logger.error(f"TF-IDF similarity error: {e}")
        return []


def calculate_embedding_similarity(sentence_model, job_embeddings, resume_text: str, top_k: int = 50) -> List[Tuple[int, float]]:
    """Calculate embedding-based similarity."""
    if sentence_model is None or job_embeddings is None:
        return []
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        resume_embedding = sentence_model.encode([resume_text])
        similarities = cosine_similarity(resume_embedding, job_embeddings).flatten()
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [(int(idx), float(similarities[idx])) for idx in top_indices]
    except Exception as e:
        logger.error(f"Embedding similarity error: {e}")
        return []


def calculate_skill_match_score(resume_skills: List[str], job_skills: List[str]) -> float:
    """Calculate Jaccard similarity for skills."""
    if not resume_skills or not job_skills:
        return 0.0
    r_lower = {s.lower() for s in resume_skills}
    j_lower = {s.lower() for s in job_skills}
    common = r_lower & j_lower
    union = r_lower | j_lower
    return len(common) / len(union) if union else 0.0


def combine_similarity_scores(
    jobs_data: List[Dict],
    tfidf_scores: List[Tuple[int, float]],
    embedding_scores: List[Tuple[int, float]],
    resume_skills: List[str],
    location_filter: str = None,
    resume_experience_level: str = None,
    resume_job_titles: List[str] = None,
    determine_job_level_fn=None,
) -> List[Tuple[int, float]]:
    """Combine TF-IDF, embedding, and skill scores with filtering."""
    from .formatters import determine_job_experience_level
    fn = determine_job_level_fn or determine_job_experience_level

    tfidf_dict = {idx: s for idx, s in tfidf_scores}
    embedding_dict = {idx: s for idx, s in embedding_scores}
    all_indices = set(tfidf_dict.keys()) | set(embedding_dict.keys())

    combined = []
    for idx in all_indices:
        if idx >= len(jobs_data):
            continue
        job = jobs_data[idx]

        if location_filter and location_filter.strip():
            kw = location_filter.lower().split()
            loc = job.get('location', '').lower()
            if not any(k in loc for k in kw):
                continue

        if resume_experience_level:
            job_level = fn(job)
            level_map = {
                'fresher': ['fresher', 'internship'],
                'junior': ['fresher', 'junior', 'mid'],
                'mid': ['junior', 'mid', 'senior'],
                'senior': ['mid', 'senior'],
            }
            allowed = level_map.get(resume_experience_level, ['fresher', 'junior', 'mid', 'senior'])
            if job_level not in allowed:
                continue

        tfidf_s = tfidf_dict.get(idx, 0.0)
        emb_s = embedding_dict.get(idx, 0.0)
        skill_s = calculate_skill_match_score(resume_skills, job.get('skills', []))
        score = 0.20 * tfidf_s + 0.50 * emb_s + 0.30 * skill_s

        if skill_s > 0.5:
            score *= 1.2
        if resume_job_titles:
            jt = job.get('title', '').lower()
            for t in resume_job_titles:
                if t.lower() in jt or jt in t.lower():
                    score *= 1.15
                    break

        combined.append((idx, score))

    combined.sort(key=lambda x: x[1], reverse=True)

    linkedin = [(i, s) for i, s in combined if jobs_data[i].get('source', 'LinkedIn') != 'Naukri']
    naukri = [(i, s) for i, s in combined if jobs_data[i].get('source') == 'Naukri']
    mixed = []
    for i in range(max(len(linkedin), len(naukri))):
        if i < len(linkedin):
            mixed.append(linkedin[i])
        if i < len(naukri):
            mixed.append(naukri[i])

    return mixed
