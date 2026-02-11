import { IVideoRepository } from "@/domain/repositories/IVideoRepository";
import {
  Video,
  VideoWithSubtitles,
  CreateVideoInput,
  UpdateVideoInput,
} from "@/domain/types";
import ExtractVideo from "@/lib/toomvaUtil";

export class VideoUseCase {
  constructor(private videoRepository: IVideoRepository) {}

  async createVideo(input: CreateVideoInput): Promise<VideoWithSubtitles> {
    let inputData: CreateVideoInput = input;
    if (input.webUrl) {
      console.log("Create video from url")
      inputData = await ExtractVideo(input.webUrl);
    }
    // Validation
    if (!inputData.title || inputData.title.trim() === "") {
      throw new Error("Title is required");
    }
    if (!inputData.videoUrl || inputData.videoUrl.trim() === "") {
      throw new Error("Video URL is required");
    }
    if (
      !inputData.subtitles ||
      inputData.subtitles.english.length === 0 ||
      !inputData.subtitles.vietnamese ||
      inputData.subtitles.vietnamese.length === 0
    ) {
      throw new Error("Both English and Vietnamese subtitles are required");
    }

    return await this.videoRepository.create(inputData);
  }

  async getVideoById(id: string): Promise<VideoWithSubtitles | null> {
    return await this.videoRepository.findById(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return await this.videoRepository.findAll();
  }

  async updateVideo(
    id: string,
    input: UpdateVideoInput,
  ): Promise<VideoWithSubtitles> {
    const existingVideo = await this.videoRepository.findById(id);
    if (!existingVideo) {
      throw new Error("Video not found");
    }

    return await this.videoRepository.update(id, input);
  }

  async deleteVideo(id: string): Promise<void> {
    const existingVideo = await this.videoRepository.findById(id);
    if (!existingVideo) {
      throw new Error("Video not found");
    }

    await this.videoRepository.delete(id);
  }
}
