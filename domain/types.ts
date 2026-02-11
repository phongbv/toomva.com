// Domain Types
export interface DualSubtitleEntry {
  startTime: number; // in seconds
  endTime: number;
  textEn: string;
  textVi: string;
}
export interface SubtitleEntry {
  index: number;
  startTime: number; // in seconds
  endTime: number;
  text: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtitle {
  id: string;
  videoId: string;
  language: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoWithSubtitles extends Video {
  subtitles: Subtitle[];
}

export interface CreateVideoInput {
  webUrl?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  subtitles: {
    english: SubtitleEntry[];
    vietnamese: SubtitleEntry[];
  };
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface DictionaryResponse {
  word: string;
  html: string; // HTML content from dictionary API
}
