"""Model initialization and cache handling for job recommender."""
import gc
import os
import pickle
import logging
from typing import Optional, Tuple, Any

logger = logging.getLogger(__name__)


def load_from_cache(
    cache_file: str,
    data_path: str,
    jobs_count: int,
    model_name: str,
) -> Optional[Tuple[Any, Any, Any, Any]]:
    """Load TF-IDF and embeddings from cache if valid. Returns (tfidf_vectorizer, tfidf_matrix, job_embeddings) or None."""
    try:
        if not os.path.exists(cache_file):
            return None

        cache_mtime = os.path.getmtime(cache_file)
        data_mtime = os.path.getmtime(data_path)
        if data_mtime > cache_mtime:
            logger.warning("Cache might be stale (Data file newer), loading anyway to prevent OOM")

        with open(cache_file, 'rb') as f:
            data = pickle.load(f)

        tfidf_vectorizer = data['tfidf_vectorizer']
        tfidf_matrix = data['tfidf_matrix']
        job_embeddings = data['job_embeddings']

        if tfidf_matrix.shape[0] != jobs_count:
            logger.warning("Cache mismatch: Job count differs")
            return None

        from sentence_transformers import SentenceTransformer
        sentence_model = SentenceTransformer(model_name)

        return (tfidf_vectorizer, tfidf_matrix, sentence_model, job_embeddings)

    except Exception as e:
        logger.warning(f"Failed to load cache: {e}")
        return None


def save_to_cache(cache_file: str, tfidf_vectorizer, tfidf_matrix, job_embeddings) -> None:
    """Save models to cache."""
    try:
        with open(cache_file, 'wb') as f:
            pickle.dump({
                'tfidf_vectorizer': tfidf_vectorizer,
                'tfidf_matrix': tfidf_matrix,
                'job_embeddings': job_embeddings,
            }, f)
        logger.info("Cache saved successfully")
    except Exception as e:
        logger.error(f"Failed to save cache: {e}")


def initialize_models(
    jobs_data: list,
    data_path: str,
    model_name: str,
) -> Tuple[Any, Any, Any, Any]:
    """Initialize TF-IDF and Sentence Transformer models (or load from cache)."""
    gc.collect()

    data_dir = os.path.dirname(os.path.abspath(data_path))
    cache_file = os.path.join(data_dir, 'model_cache.pkl')

    cached = load_from_cache(cache_file, data_path, len(jobs_data), model_name)
    if cached:
        return cached

    from sklearn.feature_extraction.text import TfidfVectorizer

    job_texts = [j.get('combined_text', '') for j in jobs_data]
    tfidf_vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.8,
    )
    tfidf_matrix = tfidf_vectorizer.fit_transform(job_texts)

    from sentence_transformers import SentenceTransformer
    sentence_model = SentenceTransformer(model_name)

    batch_size = 32
    total_jobs = len(job_texts)
    job_embeddings = None

    for i in range(0, total_jobs, batch_size):
        batch = job_texts[i:i + batch_size]
        batch_emb = sentence_model.encode(batch, show_progress_bar=False)
        import numpy as np
        if job_embeddings is None:
            job_embeddings = batch_emb
        else:
            job_embeddings = np.vstack((job_embeddings, batch_emb))
        del batch, batch_emb
        gc.collect()

    save_to_cache(cache_file, tfidf_vectorizer, tfidf_matrix, job_embeddings)
    return (tfidf_vectorizer, tfidf_matrix, sentence_model, job_embeddings)
