'use client';

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SubtitleSidebar } from '@/components/SubtitleSidebar';
import { DictionaryPopup } from '@/components/DictionaryPopup';
import { SubtitleEntry, VideoWithSubtitles } from '@/domain/types';

interface VideoPlayerPageProps {
  videoId: string;
}

export const VideoPlayerPage: React.FC<VideoPlayerPageProps> = ({ videoId }) => {
  const [video, setVideo] = useState<VideoWithSubtitles | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  
  // Dictionary popup state
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [dictionaryHtml, setDictionaryHtml] = useState('');
  const [isLoadingDict, setIsLoadingDict] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      if (!response.ok) throw new Error('Failed to fetch video');
      
      const data: VideoWithSubtitles = await response.json();
      setVideo(data);

      // Parse subtitles
      const enSubtitle = data.subtitles.find(s => s.language === 'en');
      if (enSubtitle) {
        const parsed = JSON.parse(enSubtitle.content) as SubtitleEntry[];
        setSubtitles(parsed);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = async (word: string) => {
    setSelectedWord(word);
    setIsDictionaryOpen(true);
    setIsLoadingDict(true);

    try {
      const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
      const data = await response.json();
      setDictionaryHtml(data.html);
    } catch (error) {
      console.error('Error fetching dictionary:', error);
      setDictionaryHtml('<div class="error">Failed to load definition</div>');
    } finally {
      setIsLoadingDict(false);
    }
  };

  const handleSubtitleClick = (time: number) => {
    setSeekTo(time);
    // Reset seekTo after a short delay
    setTimeout(() => setSeekTo(null), 100);
  };

  const handleContinuePlaying = () => {
    // Auto-play video when dictionary popup closes
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Video not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        {video.description && (
          <p className="text-gray-600 mt-1">{video.description}</p>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <VideoPlayer
            videoUrl={video.videoUrl}
            subtitles={subtitles}
            onTimeUpdate={setCurrentTime}
            onWordClick={handleWordClick}
            seekTo={seekTo}
            onVideoRefReady={(ref) => {
              videoRef.current = ref.current;
            }}
          />
        </div>

        <div className="w-96">
          <SubtitleSidebar
            subtitles={subtitles}
            currentTime={currentTime}
            onSubtitleClick={handleSubtitleClick}
          />
        </div>
      </div>

      <DictionaryPopup
        word={selectedWord}
        html={isLoadingDict ? '<div>Loading...</div>' : dictionaryHtml}
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onContinue={handleContinuePlaying}
      />
    </div>
  );
};
