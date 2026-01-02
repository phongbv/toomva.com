'use client';

import React, { useState, useEffect } from 'react';
import { SubtitleEntry } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditVideoFormProps {
  videoId: string;
  onVideoUpdated: () => void;
  onCancel: () => void;
}

export const EditVideoForm: React.FC<EditVideoFormProps> = ({ 
  videoId, 
  onVideoUpdated,
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [englishSubtitles, setEnglishSubtitles] = useState('');
  const [vietnameseSubtitles, setVietnameseSubtitles] = useState('');
  const [englishSubtitleUrl, setEnglishSubtitleUrl] = useState('');
  const [vietnameseSubtitleUrl, setVietnameseSubtitleUrl] = useState('');
  const [useUrlForEnglish, setUseUrlForEnglish] = useState(false);
  const [useUrlForVietnamese, setUseUrlForVietnamese] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingVideo, setIsFetchingVideo] = useState(true);
  const [isFetchingSubtitles, setIsFetchingSubtitles] = useState(false);

  useEffect(() => {
    fetchVideoData();
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      if (response.ok) {
        const video = await response.json();
        setTitle(video.title || '');
        setDescription(video.description || '');
        setVideoUrl(video.videoUrl || '');
        setThumbnailUrl(video.thumbnailUrl || '');
        
        // Convert subtitles back to SRT format for editing
        if (video.subtitles?.english?.length > 0) {
          setEnglishSubtitles(convertToSRT(video.subtitles.english));
        }
        if (video.subtitles?.vietnamese?.length > 0) {
          setVietnameseSubtitles(convertToSRT(video.subtitles.vietnamese));
        }
      } else {
        alert('Failed to load video data');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('Failed to load video data');
    } finally {
      setIsFetchingVideo(false);
    }
  };

  const convertToSRT = (subtitles: SubtitleEntry[]): string => {
    return subtitles
      .map((sub, index) => {
        const startTime = formatTime(sub.startTime);
        const endTime = formatTime(sub.endTime);
        const text = sub.textEn || sub.textVi;
        return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`;
      })
      .join('\n');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
  };

  const parseSRT = (srtContent: string): SubtitleEntry[] => {
    const entries: SubtitleEntry[] = [];
    
    let content = srtContent.trim();
    const isVTT = content.startsWith('WEBVTT');
    if (isVTT) {
      content = content.replace(/^WEBVTT[^\n]*\n+/, '');
    }
    
    content = content.replace(/NOTE\s+[^\n]*\n+/g, '');
    
    const lines = content.split('\n');
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (!line) {
        i++;
        continue;
      }
      
      let timeLineIndex = -1;
      let timeLine = '';
      
      if (line.includes('-->')) {
        timeLineIndex = i;
        timeLine = line;
      }
      else if (i + 1 < lines.length && lines[i + 1].includes('-->')) {
        timeLineIndex = i + 1;
        timeLine = lines[i + 1];
        i++;
      }
      
      if (timeLineIndex === -1) {
        i++;
        continue;
      }

      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
      
      if (!timeMatch) {
        i++;
        continue;
      }

      const startTime =
        parseInt(timeMatch[1]) * 3600 +
        parseInt(timeMatch[2]) * 60 +
        parseInt(timeMatch[3]) +
        parseInt(timeMatch[4]) / 1000;

      const endTime =
        parseInt(timeMatch[5]) * 3600 +
        parseInt(timeMatch[6]) * 60 +
        parseInt(timeMatch[7]) +
        parseInt(timeMatch[8]) / 1000;

      i++;
      const textLines: string[] = [];
      
      while (i < lines.length) {
        const textLine = lines[i].trim();
        
        if (!textLine) {
          break;
        }
        
        if (/^\d+$/.test(textLine) && i + 1 < lines.length && lines[i + 1].includes('-->')) {
          break;
        }
        if (textLine.includes('-->')) {
          break;
        }
        
        textLines.push(textLine);
        i++;
      }
      
      let text = textLines
        .map(line => line
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim()
        )
        .filter(line => line.length > 0)
        .join(' ');

      if (!text) continue;

      entries.push({
        startTime,
        endTime,
        textEn: text,
        textVi: '',
      });
    }

    return entries;
  };

  const fetchSubtitleFromUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(`/api/fetch-subtitle?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.success || !response.ok) {
        throw new Error(data.error || 'Failed to fetch subtitle');
      }
      
      return data.content;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch subtitle from URL');
    }
  };

  const handleFetchEnglishSubtitle = async () => {
    if (!englishSubtitleUrl.trim()) return;
    setIsFetchingSubtitles(true);
    try {
      const content = await fetchSubtitleFromUrl(englishSubtitleUrl);
      setEnglishSubtitles(content);
      alert('English subtitle loaded successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to fetch English subtitle');
    } finally {
      setIsFetchingSubtitles(false);
    }
  };

  const handleFetchVietnameseSubtitle = async () => {
    if (!vietnameseSubtitleUrl.trim()) return;
    setIsFetchingSubtitles(true);
    try {
      const content = await fetchSubtitleFromUrl(vietnameseSubtitleUrl);
      setVietnameseSubtitles(content);
      alert('Vietnamese subtitle loaded successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to fetch Vietnamese subtitle');
    } finally {
      setIsFetchingSubtitles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalEnglishSubs = englishSubtitles;
      let finalVietnameseSubs = vietnameseSubtitles;

      if (useUrlForEnglish && englishSubtitleUrl.trim()) {
        finalEnglishSubs = await fetchSubtitleFromUrl(englishSubtitleUrl);
      }

      if (useUrlForVietnamese && vietnameseSubtitleUrl.trim()) {
        finalVietnameseSubs = await fetchSubtitleFromUrl(vietnameseSubtitleUrl);
      }

      const englishEntries = finalEnglishSubs ? parseSRT(finalEnglishSubs) : [];
      const vietnameseEntries = finalVietnameseSubs ? parseSRT(finalVietnameseSubs) : [];

      const mergedEntries: SubtitleEntry[] = englishEntries.map((enEntry, index) => ({
        startTime: enEntry.startTime,
        endTime: enEntry.endTime,
        textEn: enEntry.textEn,
        textVi: vietnameseEntries[index]?.textEn || '',
      }));

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnailUrl,
          subtitles: {
            english: mergedEntries,
            vietnamese: mergedEntries,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update video');
      }

      onVideoUpdated();
      alert('Video updated successfully!');
    } catch (error: any) {
      console.error('Error updating video:', error);
      alert(error.message || 'Failed to update video');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingVideo) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading video data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              required
            />
          </div>

          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {/* English Subtitles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>English Subtitles (SRT or VTT) *</Label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={useUrlForEnglish}
                  onChange={(e) => setUseUrlForEnglish(e.target.checked)}
                  className="mr-2"
                />
                Import from URL
              </label>
            </div>

            {useUrlForEnglish ? (
              <div className="flex gap-2">
                <Input
                  value={englishSubtitleUrl}
                  onChange={(e) => setEnglishSubtitleUrl(e.target.value)}
                  placeholder="https://example.com/subtitle_en.srt or .vtt"
                />
                <Button
                  type="button"
                  onClick={handleFetchEnglishSubtitle}
                  disabled={isFetchingSubtitles || !englishSubtitleUrl.trim()}
                >
                  Fetch
                </Button>
              </div>
            ) : (
              <textarea
                value={englishSubtitles}
                onChange={(e) => setEnglishSubtitles(e.target.value)}
                placeholder="Paste English subtitles (SRT or VTT format)"
                className="w-full min-h-[150px] p-3 border rounded-md font-mono text-sm"
                required={!useUrlForEnglish}
              />
            )}
          </div>

          {/* Vietnamese Subtitles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Vietnamese Subtitles (SRT or VTT) *</Label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={useUrlForVietnamese}
                  onChange={(e) => setUseUrlForVietnamese(e.target.checked)}
                  className="mr-2"
                />
                Import from URL
              </label>
            </div>

            {useUrlForVietnamese ? (
              <div className="flex gap-2">
                <Input
                  value={vietnameseSubtitleUrl}
                  onChange={(e) => setVietnameseSubtitleUrl(e.target.value)}
                  placeholder="https://example.com/subtitle_vi.srt or .vtt"
                />
                <Button
                  type="button"
                  onClick={handleFetchVietnameseSubtitle}
                  disabled={isFetchingSubtitles || !vietnameseSubtitleUrl.trim()}
                >
                  Fetch
                </Button>
              </div>
            ) : (
              <textarea
                value={vietnameseSubtitles}
                onChange={(e) => setVietnameseSubtitles(e.target.value)}
                placeholder="Paste Vietnamese subtitles (SRT or VTT format)"
                className="w-full min-h-[150px] p-3 border rounded-md font-mono text-sm"
                required={!useUrlForVietnamese}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Updating...' : 'Update Video'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
