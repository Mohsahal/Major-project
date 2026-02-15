"""Skill gap analysis endpoint."""
import os
import tempfile
from flask import Blueprint, request, jsonify

from utils.resume_parser import allowed_file, extract_resume_text
from services import get_skill_analyzer

bp = Blueprint('skill_gap', __name__)


@bp.route('/skill-gap-analysis', methods=['POST'])
def skill_gap_analysis():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400

        job_description = request.form.get('job_description', '')
        if not job_description.strip():
            return jsonify({'error': 'Job description is required'}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        try:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)

            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400

            analyzer = get_skill_analyzer()
            skill_analysis_result = analyzer.analyze_skill_gap_with_resources(resume_text, job_description)

            skill_analysis = skill_analysis_result['analysis']
            learning_resources = skill_analysis_result['learning_resources']

            completion = len(skill_analysis.get('present_skills', [])) / max(
                1, len(skill_analysis.get('present_skills', [])) + len(skill_analysis.get('missing_skills', []))
            ) * 100

            return jsonify({
                'success': True,
                'message': 'Skill gap analysis completed successfully!',
                'analysis': {
                    'present_skills': skill_analysis.get('present_skills', []),
                    'missing_skills': skill_analysis.get('missing_skills', []),
                    'additional_skills': skill_analysis.get('additional_skills', []),
                    'skill_analysis': skill_analysis.get('skill_analysis', {}),
                    'summary': {
                        'total_skills_required': len(skill_analysis.get('present_skills', [])) + len(skill_analysis.get('missing_skills', [])),
                        'skills_present': len(skill_analysis.get('present_skills', [])),
                        'skills_missing': len(skill_analysis.get('missing_skills', [])),
                        'completion_percentage': round(completion, 2)
                    }
                },
                'learning_resources': learning_resources,
                'resume_text_preview': resume_text[:500] + '...' if len(resume_text) > 500 else resume_text
            })
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        return jsonify({'error': f'An error occurred during skill gap analysis: {str(e)}'}), 500
