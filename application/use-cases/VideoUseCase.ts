import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { Video, VideoWithSubtitles, CreateVideoInput, UpdateVideoInput } from '@/domain/types';

export class VideoUseCase {
  constructor(private videoRepository: IVideoRepository) {}

  async createVideo(input: CreateVideoInput): Promise<VideoWithSubtitles> {
    // Validation
    if (!input.title || input.title.trim() === '') {
      throw new Error('Title is required');
    }
    if (!input.videoUrl || input.videoUrl.trim() === '') {
      throw new Error('Video URL is required');
    }
    if (!input.subtitles.english || input.subtitles.english.length === 0 ||
        !input.subtitles.vietnamese || input.subtitles.vietnamese.length === 0) {
      throw new Error('Both English and Vietnamese subtitles are required');
    }

    return await this.videoRepository.create(input);
  }

  async getVideoById(id: string): Promise<VideoWithSubtitles | null> {
    return await this.videoRepository.findById(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return await this.videoRepository.findAll();
  }

  async updateVideo(id: string, input: UpdateVideoInput): Promise<VideoWithSubtitles> {
    const existingVideo = await this.videoRepository.findById(id);
    if (!existingVideo) {
      throw new Error('Video not found');
    }

    return await this.videoRepository.update(id, input);
  }

  async deleteVideo(id: string): Promise<void> {
    const existingVideo = await this.videoRepository.findById(id);
    if (!existingVideo) {
      throw new Error('Video not found');
    }

    await this.videoRepository.delete(id);
  }
}
