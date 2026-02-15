"""Job recommendations: TF-IDF + sentence embeddings, resume → top jobs."""
import logging
from datetime import datetime
from typing import Dict, List, Optional

from . import data_loader
from . import preprocessing
from . import resume_analyzer
from . import similarity
from . import formatters
from . import models

logger = logging.getLogger(__name__)


class JobRecommender:
    """Stateless job recommender: analyzes resume and matches with job descriptions."""

    def __init__(self, data_path: str = None, model_name: str = "paraphrase-MiniLM-L3-v2"):
        if data_path is None:
            data_path = data_loader.get_default_data_path()
        self.data_path = data_path
        self.model_name = model_name
        self._models_initialized = False
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.sentence_model = None
        self.job_embeddings = None

        raw_jobs = data_loader.load_jobs_data(data_path)
        self.jobs_data = preprocessing.preprocess_jobs(raw_jobs)
        logger.info(f"Loaded and preprocessed {len(self.jobs_data)} jobs")

    def _ensure_models_initialized(self) -> None:
        if self._models_initialized:
            return
        logger.info("Initializing models (lazy loading)...")
        t, m, s, e = models.initialize_models(
            self.jobs_data, self.data_path, self.model_name
        )
        self.tfidf_vectorizer, self.tfidf_matrix, self.sentence_model, self.job_embeddings = t, m, s, e
        self._models_initialized = True

    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume and extract key information."""
        return resume_analyzer.analyze_resume(resume_text)

    def recommend_jobs(
        self,
        resume_text: str,
        location_filter: str = None,
        top_k: int = 10,
    ) -> Dict:
        """Main recommendation: analyze resume and return top job matches."""
        try:
            if not self.jobs_data:
                return {
                    'success': False,
                    'error': 'No jobs data available',
                    'top_jobs': [],
                    'resume_analysis': {},
                }

            self._ensure_models_initialized()
            resume_analysis = self.analyze_resume(resume_text)

            tfidf_sims = similarity.calculate_tfidf_similarity(
                self.tfidf_vectorizer, self.tfidf_matrix, resume_text, top_k * 3
            )
            emb_sims = similarity.calculate_embedding_similarity(
                self.sentence_model, self.job_embeddings, resume_text, top_k * 3
            )

            combined = similarity.combine_similarity_scores(
                self.jobs_data,
                tfidf_sims,
                emb_sims,
                resume_analysis.get('skills', []),
                location_filter=location_filter,
                resume_experience_level=resume_analysis.get('experience_level'),
                resume_job_titles=resume_analysis.get('job_titles', []),
            )

            top_jobs = formatters.format_recommendations(
                self.jobs_data,
                combined[:top_k],
                resume_analysis,
            )

            return {
                'success': True,
                'top_jobs': top_jobs,
                'resume_analysis': resume_analysis,
                'total_jobs_analyzed': len(self.jobs_data),
                'query': formatters.generate_search_query(resume_analysis),
                'timestamp': datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error in job recommendation: {e}")
            return {
                'success': False,
                'error': str(e),
                'top_jobs': [],
                'resume_analysis': {},
            }
