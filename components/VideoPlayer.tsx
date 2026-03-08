"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { DualSubtitleEntry } from "@/domain/types";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] =
    useState<DualSubtitleEntry | null>(null);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const seekBy = useCallback(
    (seconds: number) => {
      if (!videoRef.current) {
        return;
      }

      const maxDuration = duration || videoRef.current.duration || 0;
      const nextTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        maxDuration,
      );

      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
      onTimeUpdate?.(nextTime);
    },
    [duration, onTimeUpdate],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingElement =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTypingElement) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekBy(-5);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        seekBy(5);
      }

      if (event.code === "Space") {
        event.preventDefault();

        if (!videoRef.current) {
          return;
        }

        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();

        if (!containerRef.current) {
          return;
        }

        if (!document.fullscreenElement) {
          void containerRef.current.requestFullscreen();
        } else {
          void document.exitFullscreen();
        }
      }

      if (event.key === "Escape" && document.fullscreenElement) {
        event.preventDefault();
        void document.exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [seekBy]);

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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (newMuted) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume;
      }
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleWordHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    const word = (e.target as HTMLSpanElement).textContent || "";
    if (word && onWordClick) {
      videoRef.current?.pause();
      setIsPlaying(false);
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

    const words = text.split(/(\s+|[.,!?;:])/);

    return (
      <>
        {words.map((word, index) => {
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

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black group ${isFullscreen ? "h-screen" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        preload="metadata"
        autoPlay
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlayPause}
      />

      {/* Dual Subtitles Overlay */}
      {currentSubtitle && (
        <div
          className={`absolute left-0 right-0 text-center px-4 pointer-events-auto ${
            isFullscreen ? "bottom-24" : "bottom-20"
          }`}
        >
          <div className="bg-black/80 text-white py-3 px-4 rounded-lg inline-block max-w-4xl">
            <div className={`mb-1 font-medium ${isFullscreen ? "text-2xl" : "text-lg"}`}>
              {renderSubtitleWithClickableWords(currentSubtitle.textEn, true)}
            </div>
            <div className={`text-yellow-300 ${isFullscreen ? "text-xl" : "text-base"}`}>
              {currentSubtitle.textVi}
            </div>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="relative h-1.5 bg-gray-600/50 cursor-pointer hover:h-2 transition-all group/progress"
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-red-600"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="text-white hover:text-red-500 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Rewind 10s */}
          <button
            onClick={() => seekBy(-10)}
            className="relative grid h-8 w-8 place-items-center rounded-full text-white/90 transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw size={18} />
            <span className="absolute text-[9px] font-semibold leading-none">
              10
            </span>
          </button>

          {/* Forward 10s */}
          <button
            onClick={() => seekBy(10)}
            className="relative grid h-8 w-8 place-items-center rounded-full text-white/90 transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Forward 10 seconds"
          >
            <RotateCw size={18} />
            <span className="absolute text-[9px] font-semibold leading-none">
              10
            </span>
          </button>

          {/* Time Display */}
          <div className="text-white text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-white hover:text-red-500 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Playback Speed */}
          <div className="relative group/speed">
            <button className="px-3 py-1 text-sm text-white hover:bg-white/20 rounded transition-colors min-w-12">
              {playbackRate}x
            </button>
            {/* Dropdown menu - shows on hover */}
            <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-lg py-2 opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all duration-200">
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`block w-full px-4 py-2 text-sm text-left whitespace-nowrap transition-colors ${
                    playbackRate === rate
                      ? "bg-red-600 text-white"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {rate === 1 ? 'Normal' : `${rate}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-red-500 transition-colors"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
