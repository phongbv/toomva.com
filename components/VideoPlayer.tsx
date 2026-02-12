"use client";

import React, { useRef, useState, useEffect } from "react";
import { DualSubtitleEntry } from "@/domain/types";

interface VideoPlayerProps {
  videoUrl: string;
  subtitles: DualSubtitleEntry[];
  onTimeUpdate?: (currentTime: number) => void;
  onWordClick?: (word: string) => void;
  seekTo?: number | null;
  onVideoRefReady?: (ref: React.RefObject<HTMLVideoElement | null>) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  subtitles,
  onTimeUpdate,
  onWordClick,
  seekTo,
  onVideoRefReady,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] =
    useState<DualSubtitleEntry | null>(null);
  const [isHoveringWord, setIsHoveringWord] = useState(false);

  useEffect(() => {
    if (onVideoRefReady && videoRef) {
      onVideoRefReady(videoRef);
    }
  }, [onVideoRefReady]);

  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTo;
      videoRef.current.play();
    }
  }, [seekTo]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);

      // Find current subtitle
      const subtitle = subtitles.find(
        (s) => time >= s.startTime && time <= s.endTime,
      );
      setCurrentSubtitle(subtitle || null);
    }
  };

  const handleWordHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    const word = (e.target as HTMLSpanElement).textContent || "";
    if (word && onWordClick) {
      // Pause video when hovering on a word
      videoRef.current?.pause();
      setIsHoveringWord(true);
      onWordClick(word.trim());
    }
  };

  const renderSubtitleWithClickableWords = (
    text: string,
    isEnglish: boolean,
  ) => {
    if (!isEnglish) {
      return <span>{text}</span>;
    }

    // Split by spaces and punctuation, keeping the delimiters
    const words = text.split(/(\s+|[.,!?;:])/);

    return (
      <>
        {words.map((word, index) => {
          // Don't make spaces and punctuation clickable
          if (/^\s+$/.test(word) || /^[.,!?;:]$/.test(word)) {
            return <span key={index}>{word}</span>;
          }

          return (
            <span
              key={index}
              onMouseEnter={handleWordHover}
              className="cursor-pointer hover:bg-blue-200 hover:text-blue-800 transition-colors px-0.5 rounded"
            >
              {word}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        preload="none"
        autoPlay
        className="w-full rounded-lg"
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Dual Subtitles Overlay */}
      {currentSubtitle && (
        <div className="absolute bottom-20 left-0 right-0 text-center px-4">
          <div className="bg-black/80 text-white py-3 px-4 rounded-lg inline-block max-w-4xl">
            <div className="text-lg mb-1 font-medium">
              {renderSubtitleWithClickableWords(currentSubtitle.textEn, true)}
            </div>
            <div className="text-base text-yellow-300">
              {currentSubtitle.textVi}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
