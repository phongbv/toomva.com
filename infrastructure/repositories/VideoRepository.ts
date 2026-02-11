import { prisma } from '@/lib/db';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { Video, VideoWithSubtitles, CreateVideoInput, UpdateVideoInput, DualSubtitleEntry } from '@/domain/types';

export class VideoRepository implements IVideoRepository {
  async create(input: CreateVideoInput): Promise<VideoWithSubtitles> {
    const video = await prisma.video.create({
      data: {
        title: input.title,
        description: input.description,
        videoUrl: input.videoUrl,
        thumbnailUrl: input.thumbnailUrl,
        duration: input.duration,
        subtitles: {
          create: [
            {
              language: 'en',
              content: JSON.stringify(input.subtitles.english),
            },
            {
              language: 'vi',
              content: JSON.stringify(input.subtitles.vietnamese),
            },
          ],
        },
      },
      include: {
        subtitles: true,
      },
    });

    return video as VideoWithSubtitles;
  }

  async findById(id: string): Promise<VideoWithSubtitles | null> {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        subtitles: true,
      },
    });

    return video as VideoWithSubtitles | null;
  }

  async findAll(): Promise<Video[]> {
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return videos as Video[];
  }

  async update(id: string, input: UpdateVideoInput): Promise<VideoWithSubtitles> {
    const video = await prisma.video.update({
      where: { id },
      data: input,
      include: {
        subtitles: true,
      },
    });

    return video as VideoWithSubtitles;
  }

  async delete(id: string): Promise<void> {
    await prisma.video.delete({
      where: { id },
    });
  }
}
