'use client';

import React from 'react';
import { SubtitleEntry } from '@/domain/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SubtitleSidebarProps {
  subtitles: SubtitleEntry[];
  currentTime: number;
  onSubtitleClick: (time: number) => void;
}

export const SubtitleSidebar: React.FC<SubtitleSidebarProps> = ({
  subtitles,
  currentTime,
  onSubtitleClick,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = (subtitle: SubtitleEntry): boolean => {
    return currentTime >= subtitle.startTime && currentTime <= subtitle.endTime;
  };

  return (
    <div className="h-full border-l bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">Subtitles Timeline</h2>
      </div>
      
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="p-4 space-y-2">
          {subtitles.map((subtitle, index) => (
            <div
              key={index}
              onClick={() => onSubtitleClick(subtitle.startTime)}
              className={cn(
                'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                isActive(subtitle)
                  ? 'bg-blue-100 border-blue-400 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="text-xs text-gray-500 mb-1 font-medium">
                {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">
                {subtitle.textEn}
              </div>
              <div className="text-sm text-gray-600">
                {subtitle.textVi}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
