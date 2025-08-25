import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type YouTubeVideoCardProps = {
  title: string;
  channel?: string;
  videoId: string;
  description?: string;
};

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ title, channel, videoId, description }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {channel && <p className="text-xs text-gray-500">{channel}</p>}
      </CardHeader>
      {description && (
        <CardContent className="pt-0 text-sm text-gray-600">
          {description}
        </CardContent>
      )}
    </Card>
  );
};

export default YouTubeVideoCard;


