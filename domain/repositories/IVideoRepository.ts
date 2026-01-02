import { Video, VideoWithSubtitles, CreateVideoInput, UpdateVideoInput } from '@/domain/types';

export interface IVideoRepository {
  create(input: CreateVideoInput): Promise<VideoWithSubtitles>;
  findById(id: string): Promise<VideoWithSubtitles | null>;
  findAll(): Promise<Video[]>;
  update(id: string, input: UpdateVideoInput): Promise<VideoWithSubtitles>;
  delete(id: string): Promise<void>;
}
