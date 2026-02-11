"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { SubtitleEntry } from "@/domain/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const activeRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setLastIndex] = useState<number>(0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isActive = useCallback(
    (subtitle: SubtitleEntry): boolean => {
      return (
        currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
      );
    },
    [currentTime],
  );
  useEffect(() => {
    const updateCurrentIndex = () => {
      const currentIndex = subtitles.findIndex((subtitle) =>
        isActive(subtitle),
      );
      if (currentIndex !== -1) {
        setLastIndex(currentIndex);
      }
    };
    updateCurrentIndex();
  }, [currentTime, subtitles, isActive]);

  // Calculate display range: show 2 subtitles above current one
  const startIndex = Math.max(0, currentIndex - 2);
  const displayedSubtitles =
    currentIndex >= 0 ? subtitles.slice(startIndex) : subtitles;

  // Auto-scroll to active subtitle
  useEffect(() => {
    if (activeRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        const activeElement = activeRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        // Check if active element is outside viewport
        if (
          activeRect.top < containerRect.top ||
          activeRect.bottom > containerRect.bottom
        ) {
          activeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [currentIndex]);

  return (
    <div className="h-full border-l bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">Subtitles Timeline</h2>
      </div>

      <ScrollArea ref={scrollAreaRef} className="h-[calc(100%-4rem)]">
        <div className="p-4 space-y-2">
          {displayedSubtitles.map((subtitle, index) => {
            const originalIndex = startIndex + index;
            const isCurrentActive = originalIndex === currentIndex;

            return (
              <div
                key={originalIndex}
                ref={isCurrentActive ? activeRef : null}
                onClick={() => onSubtitleClick(subtitle.startTime)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                  isCurrentActive
                    ? "bg-blue-100 border-blue-400 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  {formatTime(subtitle.startTime)} -{" "}
                  {formatTime(subtitle.endTime)}
                </div>
                <div className="text-sm font-medium text-gray-800 mb-1">
                  {subtitle.textEn}
                </div>
                <div className="text-sm text-gray-600">{subtitle.textVi}</div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
