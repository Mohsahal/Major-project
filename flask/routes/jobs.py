"""Job recommendation and listing endpoints."""
import os
import tempfile
from datetime import datetime
from flask import Blueprint, request, jsonify

from utils.resume_parser import allowed_file, extract_resume_text
from services import get_job_recommender

bp = Blueprint('jobs', __name__)


def _process_and_recommend(resume_text: str, location: str, top_k: int, extra_top: bool = False):
    """Shared logic for resume upload and recommend endpoints."""
    recommender = get_job_recommender()
    rec_top = (top_k * 2) if extra_top else top_k
    recommendations = recommender.recommend_jobs(
        resume_text=resume_text,
        location_filter=None,
        top_k=rec_top
    )
    if not recommendations['success']:
        return None, recommendations.get('error', 'Failed to generate recommendations')

    jobs = recommendations['top_jobs']
    if extra_top:
        for job in jobs:
            apply_url = job.get('apply_url', '') or job.get('applyUrl', '') or job.get('apply_link', '')
            job_url = job.get('job_url', '') or job.get('jobUrl', '')
            is_linkedin = 'linkedin.com' in (job_url or apply_url)
            job['linkedin_url'] = job_url if is_linkedin else ''
            job['apply_url'] = apply_url
            job['job_url'] = job_url
            job['source'] = 'LinkedIn' if is_linkedin else 'Other'
        jobs.sort(key=lambda x: x.get('similarity', 0), reverse=True)
        jobs = jobs[:top_k]

    return recommendations, None


@bp.route('/upload-resume', methods=['POST'])
def upload_resume_and_recommend():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400

        location = request.form.get('location', '')
        top_k = int(request.form.get('top_k', 15))
        provider = request.form.get('provider', 'all')
        only_provider = request.form.get('only_provider', 'false').lower() == 'true'

        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        try:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)

            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400

            recommendations, err = _process_and_recommend(resume_text, location, top_k, extra_top=True)
            if err:
                return jsonify({'error': err}), 500

            response_data = {
                'success': True,
                'message': f"Found {len(recommendations['top_jobs'])} job recommendations!",
                'top_jobs': recommendations['top_jobs'],
                'jobs': recommendations['top_jobs'],
                'data': recommendations['top_jobs'],
                'recommendations': recommendations['top_jobs'],
                'resume_analysis': recommendations['resume_analysis'],
                'total_jobs_analyzed': recommendations['total_jobs_analyzed'],
                'query': recommendations.get('query', ''),
                'timestamp': recommendations.get('timestamp', ''),
                'filters_applied': {'location': location, 'provider': provider, 'only_provider': only_provider}
            }
            return jsonify(response_data)
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    except Exception as e:
        return jsonify({'error': f'An error occurred during job recommendation: {str(e)}'}), 500


@bp.route('/recommend-jobs', methods=['POST'])
def recommend_jobs_enhanced():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files only.'}), 400

        location = request.form.get('location', '')
        top_k = int(request.form.get('top_k', 15))

        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        try:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_resume_text(temp_file_path, file_extension)

            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from resume. Please ensure the file contains readable text.'}), 400

            recommendations, err = _process_and_recommend(resume_text, location, top_k, extra_top=False)
            if err:
                return jsonify({'error': err}), 500

            return jsonify({
                'success': True,
                'message': f"Found {len(recommendations['top_jobs'])} job recommendations!",
                'jobs': recommendations['top_jobs'],
                'top_jobs': recommendations['top_jobs'],
                'resume_analysis': recommendations['resume_analysis'],
                'total_jobs_analyzed': recommendations['total_jobs_analyzed'],
                'query': recommendations.get('query', ''),
                'timestamp': recommendations.get('timestamp', ''),
                'filters_applied': {'location': location, 'top_k': top_k}
            })
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    except Exception as e:
        return jsonify({'error': f'An error occurred during job recommendation: {str(e)}'}), 500


@bp.route('/jobs-stats', methods=['GET'])
def get_jobs_stats():
    try:
        recommender = get_job_recommender()
        jobs_data = recommender.jobs_data

        if not jobs_data:
            return jsonify({'success': True, 'total_jobs': 0, 'stats': {}})

        companies, locations, sectors, experience_levels = {}, {}, {}, {}
        for job in jobs_data:
            company = job.get('company', job.get('companyName', 'Unknown'))
            companies[company] = companies.get(company, 0) + 1
            loc = job.get('location', 'Unknown')
            locations[loc] = locations.get(loc, 0) + 1
            sec = job.get('sector', 'Unknown')
            sectors[sec] = sectors.get(sec, 0) + 1
            exp = job.get('experience_level', job.get('experienceLevel', 'Unknown'))
            experience_levels[exp] = experience_levels.get(exp, 0) + 1

        stats = {
            'total_jobs': len(jobs_data),
            'top_companies': sorted(companies.items(), key=lambda x: x[1], reverse=True)[:10],
            'top_locations': sorted(locations.items(), key=lambda x: x[1], reverse=True)[:10],
            'top_sectors': sorted(sectors.items(), key=lambda x: x[1], reverse=True)[:10],
            'experience_levels': dict(experience_levels),
            'last_updated': datetime.now().isoformat()
        }
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'error': f'An error occurred getting job statistics: {str(e)}'}), 500


@bp.route('/all-jobs', methods=['GET'])
def get_all_jobs():
    try:
        recommender = get_job_recommender()
        jobs_data = recommender.jobs_data

        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page

        formatted_jobs = []
        seen_job_ids = set()
        for i, job in enumerate(jobs_data[start_idx:end_idx], start_idx):
            job_id = job.get('id', str(i))
            if job_id in seen_job_ids:
                continue
            seen_job_ids.add(job_id)

            job_url = job.get('jobUrl', job.get('job_url', ''))
            apply_url = job.get('applyUrl', job.get('apply_url', ''))
            primary_apply_link = apply_url if apply_url else job_url
            desc = job.get('description', '')
            desc_preview = (desc[:300] + '...') if len(desc) > 300 else desc

            formatted_jobs.append({
                'id': job_id,
                'title': job.get('title', 'No Title'),
                'company': job.get('companyName', job.get('company', 'Unknown Company')),
                'location': job.get('location', 'Unknown Location'),
                'description': desc_preview,
                'similarity': 85,
                'skills_required': job.get('skills', [])[:5],
                'skills_matched': [],
                'skills_missing': [],
                'experience_level': job.get('experienceLevel', job.get('experience_level', '')),
                'contract_type': job.get('contractType', ''),
                'work_type': job.get('workType', ''),
                'sector': job.get('sector', ''),
                'apply_link': primary_apply_link,
                'apply_url': apply_url,
                'job_url': job_url,
                'linkedin_url': job_url if 'linkedin.com' in job_url else '',
                'posted_time': job.get('postedTime', job.get('posted_time', '')),
                'applications_count': job.get('applicationsCount', ''),
                'company_url': job.get('companyUrl', ''),
                'salary': job.get('salary', ''),
                'source': 'LinkedIn' if 'linkedin.com' in job_url else 'Other'
            })

        return jsonify({
            'success': True,
            'jobs': formatted_jobs,
            'total_jobs': len(jobs_data),
            'page': page,
            'per_page': per_page,
            'total_pages': (len(jobs_data) + per_page - 1) // per_page,
            'message': f'Retrieved {len(formatted_jobs)} jobs'
        })
    except Exception as e:
        return jsonify({'error': f'An error occurred getting jobs: {str(e)}'}), 500
