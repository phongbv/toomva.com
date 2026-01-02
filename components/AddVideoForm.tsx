'use client';

import React, { useState } from 'react';
import { SubtitleEntry } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddVideoFormProps {
  onVideoAdded: () => void;
}

export const AddVideoForm: React.FC<AddVideoFormProps> = ({ onVideoAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [englishSubtitles, setEnglishSubtitles] = useState('');
  const [vietnameseSubtitles, setVietnameseSubtitles] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseSRT = (srtContent: string): SubtitleEntry[] => {
    const entries: SubtitleEntry[] = [];
    const blocks = srtContent.trim().split(/\n\n+/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;

      // Parse time line (format: 00:00:01,000 --> 00:00:04,000)
      const timeLine = lines[1];
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      
      if (!timeMatch) continue;

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

      const text = lines.slice(2).join(' ');

      entries.push({
        startTime,
        endTime,
        textEn: '',
        textVi: '',
      });

      // Will set textEn or textVi later
      entries[entries.length - 1].textEn = text;
    }

    return entries;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const englishEntries = parseSRT(englishSubtitles);
      const vietnameseEntries = parseSRT(vietnameseSubtitles);

      // Merge entries
      const mergedEntries: SubtitleEntry[] = englishEntries.map((enEntry, index) => ({
        startTime: enEntry.startTime,
        endTime: enEntry.endTime,
        textEn: enEntry.textEn,
        textVi: vietnameseEntries[index]?.textEn || '',
      }));

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
            english: mergedEntries,
            vietnamese: mergedEntries,
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

          <div>
            <Label htmlFor="englishSubs">English Subtitles (SRT format) *</Label>
            <textarea
              id="englishSubs"
              value={englishSubtitles}
              onChange={(e) => setEnglishSubtitles(e.target.value)}
              required
              className="w-full min-h-[150px] p-2 border rounded-md font-mono text-sm"
              placeholder="1&#10;00:00:01,000 --> 00:00:04,000&#10;Hello World"
            />
          </div>

          <div>
            <Label htmlFor="vietnameseSubs">Vietnamese Subtitles (SRT format) *</Label>
            <textarea
              id="vietnameseSubs"
              value={vietnameseSubtitles}
              onChange={(e) => setVietnameseSubtitles(e.target.value)}
              required
              className="w-full min-h-[150px] p-2 border rounded-md font-mono text-sm"
              placeholder="1&#10;00:00:01,000 --> 00:00:04,000&#10;Xin chào thế giới"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Video'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
