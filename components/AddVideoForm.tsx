'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseSubtitles } from '@/lib/vttUtil';

interface AddVideoFormProps {
  onVideoAdded: () => void;
}

export const AddVideoForm: React.FC<AddVideoFormProps> = ({ onVideoAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [englishSubtitles, setEnglishSubtitles] = useState('');
  const [vietnameseSubtitles, setVietnameseSubtitles] = useState('');
  const [englishSubtitleUrl, setEnglishSubtitleUrl] = useState('');
  const [vietnameseSubtitleUrl, setVietnameseSubtitleUrl] = useState('');
  const [useUrlForEnglish, setUseUrlForEnglish] = useState(true);
  const [useUrlForVietnamese, setUseUrlForVietnamese] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSubtitles, setIsFetchingSubtitles] = useState(false);

  const fetchSubtitleFromUrl = async (url: string): Promise<string> => {
    try {
      // Call server-side API to bypass CORS
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
      // Fetch subtitles from URL if needed
      let finalEnglishSubs = englishSubtitles;
      let finalVietnameseSubs = vietnameseSubtitles;

      if (useUrlForEnglish && englishSubtitleUrl.trim()) {
        finalEnglishSubs = await fetchSubtitleFromUrl(englishSubtitleUrl);
      }

      if (useUrlForVietnamese && vietnameseSubtitleUrl.trim()) {
        finalVietnameseSubs = await fetchSubtitleFromUrl(vietnameseSubtitleUrl);
      }

      const englishEntries = parseSubtitles(finalEnglishSubs);
      const vietnameseEntries = parseSubtitles(finalVietnameseSubs);

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          subtitles: {
            english: englishEntries,
            vietnamese: vietnameseEntries,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create video');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setEnglishSubtitles('');
      setVietnameseSubtitles('');
      setEnglishSubtitleUrl('');
      setVietnameseSubtitleUrl('');
      setUseUrlForEnglish(false);
      setUseUrlForVietnamese(false);
      
      onVideoAdded();
      alert('Video added successfully!');
    } catch (error: any) {
      console.error('Error adding video:', error);
      alert(error.message || 'Failed to add video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">Video URL (MP4) *</Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              placeholder="https://example.com/video.mp4"
            />
          </div>

          {/* English Subtitles Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="englishSubs">English Subtitles (SRT or VTT) *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useUrlForEnglish"
                  checked={useUrlForEnglish}
                  onChange={(e) => setUseUrlForEnglish(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="useUrlForEnglish" className="text-sm cursor-pointer">
                  Import from URL
                </label>
              </div>
            </div>

            {useUrlForEnglish ? (
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={englishSubtitleUrl}
                  onChange={(e) => setEnglishSubtitleUrl(e.target.value)}
                  placeholder="https://example.com/subtitles-en.srt or .vtt"
                  required={useUrlForEnglish}
                />
                <Button
                  type="button"
                  onClick={handleFetchEnglishSubtitle}
                  disabled={isFetchingSubtitles || !englishSubtitleUrl.trim()}
                  className="whitespace-nowrap"
                >
                  {isFetchingSubtitles ? 'Loading...' : 'Fetch'}
                </Button>
              </div>
            ) : (
              <textarea
                id="englishSubs"
                value={englishSubtitles}
                onChange={(e) => setEnglishSubtitles(e.target.value)}
                required={!useUrlForEnglish}
                className="w-full min-h-[150px] p-2 border rounded-md font-mono text-sm"
                placeholder="SRT or VTT format&#10;WEBVTT&#10;&#10;1&#10;00:00:01.000 --> 00:00:04.000&#10;Hello World"
              />
            )}
          </div>

          {/* Vietnamese Subtitles Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vietnameseSubs">Vietnamese Subtitles (SRT or VTT) *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useUrlForVietnamese"
                  checked={useUrlForVietnamese}
                  onChange={(e) => setUseUrlForVietnamese(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="useUrlForVietnamese" className="text-sm cursor-pointer">
                  Import from URL
                </label>
              </div>
            </div>

            {useUrlForVietnamese ? (
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={vietnameseSubtitleUrl}
                  onChange={(e) => setVietnameseSubtitleUrl(e.target.value)}
                  placeholder="https://example.com/subtitles-vi.srt or .vtt"
                  required={useUrlForVietnamese}
                />
                <Button
                  type="button"
                  onClick={handleFetchVietnameseSubtitle}
                  disabled={isFetchingSubtitles || !vietnameseSubtitleUrl.trim()}
                  className="whitespace-nowrap"
                >
                  {isFetchingSubtitles ? 'Loading...' : 'Fetch'}
                </Button>
              </div>
            ) : (
              <textarea
                id="vietnameseSubs"
                value={vietnameseSubtitles}
                onChange={(e) => setVietnameseSubtitles(e.target.value)}
                required={!useUrlForVietnamese}
                className="w-full min-h-[150px] p-2 border rounded-md font-mono text-sm"
                placeholder="SRT or VTT format&#10;WEBVTT&#10;&#10;1&#10;00:00:01.000 --> 00:00:04.000&#10;Xin chào thế giới"
              />
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Video'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
