"""Skill gap analysis using Gemini AI with regex fallback."""
import os
import json
import google.generativeai as genai
from googleapiclient.discovery import build

from . import skills_extractor
from . import youtube_client
from . import learning


class SkillGapAnalyzer:
    """Analyzes skill gap between resume and job description."""

    def __init__(self, gemini_api_key=None, youtube_api_key=None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.youtube_api_key = youtube_api_key or os.getenv("YOUTUBE_API_KEY")
        self.youtube = None
        if self.youtube_api_key:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.youtube_api_key)
            except Exception:
                pass

    def analyze_skill_gap(self, resume_text: str, job_description: str) -> dict:
        """Analyze skill gap using Gemini AI with regex fallback."""
        try:
            if not self.gemini_api_key:
                raise Exception("GEMINI_API_KEY not configured")

            client = genai.Client(api_key=self.gemini_api_key)
            prompt = """You are an expert technical recruiter performing a detailed skill gap analysis.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

TASK: Perform a comprehensive skill gap analysis comparing the resume against the job requirements.

Return your analysis in this EXACT JSON format (no markdown, no extra text):
{{
  "job_required_skills": ["skill1", "skill2", ...],
  "present_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "additional_skills": ["skill1", "skill2", ...],
  "skill_details": {{
    "skill_name": {{
      "status": "present|missing|additional",
      "evidence": "where found or why missing",
      "importance": "high|medium|low",
      "proficiency_level": "expert|intermediate|beginner|not_found"
    }}
  }}
}}

JSON only:"""

            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt.format(resume_text=resume_text[:4000], job_description=job_description)
            )
            analysis_text = response.text.strip()

            analysis_text = analysis_text.replace('```json', '').replace('```', '').strip()
            if '{' in analysis_text and '}' in analysis_text:
                start = analysis_text.find('{')
                end = analysis_text.rfind('}') + 1
                analysis_text = analysis_text[start:end]

            data = json.loads(analysis_text)
            present = data.get('present_skills', [])
            missing = data.get('missing_skills', [])
            additional = data.get('additional_skills', [])
            details = data.get('skill_details', {})

            skill_analysis = {}
            for skill, d in details.items():
                skill_analysis[skill] = {
                    "status": d.get('status', 'unknown'),
                    "importance": d.get('importance', 'medium'),
                    "level": d.get('proficiency_level', 'intermediate'),
                    "evidence": d.get('evidence', '')
                }
            if not skill_analysis:
                high = ["python", "javascript", "react", "java", "aws", "docker", "machine learning", "data science"]
                for s in present:
                    skill_analysis[s] = {"status": "present", "importance": "high" if s.lower() in high else "medium", "level": "intermediate"}
                for s in missing:
                    skill_analysis[s] = {"status": "missing", "importance": "high" if s.lower() in high else "medium", "level": "basic"}
                for s in additional:
                    skill_analysis[s] = {"status": "additional", "importance": "medium", "level": "intermediate"}

            return {
                "present_skills": present,
                "missing_skills": missing,
                "additional_skills": additional,
                "skill_analysis": skill_analysis
            }

        except (json.JSONDecodeError, KeyError, TypeError):
            return skills_extractor.extract_skills_fallback_improved(resume_text, job_description)

        except Exception:
            return skills_extractor.extract_skills_fallback_improved(resume_text, job_description)

    def get_youtube_videos(self, skill: str, max_results: int = 3):
        """Get YouTube video suggestions for a skill."""
        return youtube_client.get_youtube_videos(self.youtube, skill, max_results)

    def generate_learning_recommendations(self, missing_skills: list):
        """Generate learning recommendations for missing skills."""
        return learning.generate_learning_recommendations(missing_skills)

    def analyze_skill_gap_with_resources(self, resume_text: str, job_description: str) -> dict:
        """Complete skill gap analysis with learning resources."""
        skill_analysis = self.analyze_skill_gap(resume_text, job_description)
        missing_skills_videos = {}
        for skill in (skill_analysis.get('missing_skills') or [])[:5]:
            videos = self.get_youtube_videos(skill)
            if videos:
                missing_skills_videos[skill] = videos
        recs = self.generate_learning_recommendations(skill_analysis.get('missing_skills', []))
        return {
            'analysis': skill_analysis,
            'learning_resources': {
                'youtube_videos': missing_skills_videos,
                'recommendations': recs
            }
        }
