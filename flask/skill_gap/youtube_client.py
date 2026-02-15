"""YouTube API client for learning resources."""
from typing import List, Dict, Optional, Any


def get_youtube_videos(youtube_client: Optional[Any], skill: str, max_results: int = 3) -> List[Dict]:
    """Get YouTube video suggestions for a skill."""
    if not youtube_client:
        return []
    try:
        request = youtube_client.search().list(
            q=f"{skill} tutorial programming",
            part="snippet",
            type="video",
            maxResults=max_results,
            order="relevance"
        )
        response = request.execute()
        videos = []
        for item in response.get('items', []):
            video_id = item['id'].get('videoId')
            if video_id:
                desc = item['snippet'].get('description', '')
                thumbnails = item['snippet'].get('thumbnails', {})
                thumb_url = thumbnails.get('medium', thumbnails.get('default', {})).get('url', '')
                videos.append({
                    'title': item['snippet']['title'],
                    'channel': item['snippet']['channelTitle'],
                    'videoId': video_id,
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'thumbnail': thumb_url,
                    'description': (desc[:150] + '...') if len(desc) > 150 else desc
                })
        return videos
    except Exception:
        return []
