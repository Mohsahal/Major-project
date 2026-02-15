"""Lazy-initialized singletons for skill analyzer and job recommender."""
import os

skill_analyzer = None
job_recommender = None


def get_skill_analyzer():
    global skill_analyzer
    if skill_analyzer is None:
        from skill_gap_analyzer import SkillGapAnalyzer
        skill_analyzer = SkillGapAnalyzer(
            os.getenv("GEMINI_API_KEY"),
            os.getenv("YOUTUBE_API_KEY")
        )
    return skill_analyzer


def get_job_recommender():
    global job_recommender
    if job_recommender is None:
        from job_recommender import JobRecommender
        job_recommender = JobRecommender()
    return job_recommender
