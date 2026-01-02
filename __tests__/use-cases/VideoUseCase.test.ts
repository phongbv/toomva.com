import { VideoUseCase } from '@/application/use-cases/VideoUseCase';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { VideoWithSubtitles, CreateVideoInput } from '@/domain/types';

describe('VideoUseCase', () => {
  let videoUseCase: VideoUseCase;
  let mockVideoRepository: jest.Mocked<IVideoRepository>;

  beforeEach(() => {
    mockVideoRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    videoUseCase = new VideoUseCase(mockVideoRepository);
  });

  describe('createVideo', () => {
    const validInput: CreateVideoInput = {
      title: 'Test Video',
      description: 'Test Description',
      videoUrl: 'https://example.com/video.mp4',
      subtitles: {
        english: [
          { startTime: 0, endTime: 2, textEn: 'Hello', textVi: 'Xin chào' },
        ],
        vietnamese: [
          { startTime: 0, endTime: 2, textEn: 'Hello', textVi: 'Xin chào' },
        ],
      },
    };

    it('should create a video with valid input', async () => {
      const mockVideo: VideoWithSubtitles = {
        id: '1',
        title: validInput.title,
        description: validInput.description,
        videoUrl: validInput.videoUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        subtitles: [],
      };

      mockVideoRepository.create.mockResolvedValue(mockVideo);

      const result = await videoUseCase.createVideo(validInput);

      expect(mockVideoRepository.create).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockVideo);
    });

    it('should throw error when title is empty', async () => {
      const invalidInput = { ...validInput, title: '' };

      await expect(videoUseCase.createVideo(invalidInput)).rejects.toThrow(
        'Title is required'
      );
      expect(mockVideoRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when video URL is empty', async () => {
      const invalidInput = { ...validInput, videoUrl: '' };

      await expect(videoUseCase.createVideo(invalidInput)).rejects.toThrow(
        'Video URL is required'
      );
      expect(mockVideoRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when subtitles are missing', async () => {
      const invalidInput = {
        ...validInput,
        subtitles: { english: [], vietnamese: [] },
      };

      await expect(videoUseCase.createVideo(invalidInput)).rejects.toThrow(
        'Both English and Vietnamese subtitles are required'
      );
      expect(mockVideoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getVideoById', () => {
    it('should return video when found', async () => {
      const mockVideo: VideoWithSubtitles = {
        id: '1',
        title: 'Test Video',
        videoUrl: 'https://example.com/video.mp4',
        createdAt: new Date(),
        updatedAt: new Date(),
        subtitles: [],
      };

      mockVideoRepository.findById.mockResolvedValue(mockVideo);

      const result = await videoUseCase.getVideoById('1');

      expect(mockVideoRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockVideo);
    });

    it('should return null when video not found', async () => {
      mockVideoRepository.findById.mockResolvedValue(null);

      const result = await videoUseCase.getVideoById('999');

      expect(result).toBeNull();
    });
  });

  describe('updateVideo', () => {
    it('should update video when exists', async () => {
      const existingVideo: VideoWithSubtitles = {
        id: '1',
        title: 'Old Title',
        videoUrl: 'https://example.com/video.mp4',
        createdAt: new Date(),
        updatedAt: new Date(),
        subtitles: [],
      };

      const updateInput = { title: 'New Title' };

      const updatedVideo: VideoWithSubtitles = {
        ...existingVideo,
        title: 'New Title',
      };

      mockVideoRepository.findById.mockResolvedValue(existingVideo);
      mockVideoRepository.update.mockResolvedValue(updatedVideo);

      const result = await videoUseCase.updateVideo('1', updateInput);

      expect(mockVideoRepository.findById).toHaveBeenCalledWith('1');
      expect(mockVideoRepository.update).toHaveBeenCalledWith('1', updateInput);
      expect(result).toEqual(updatedVideo);
    });

    it('should throw error when video not found', async () => {
      mockVideoRepository.findById.mockResolvedValue(null);

      await expect(
        videoUseCase.updateVideo('999', { title: 'New Title' })
      ).rejects.toThrow('Video not found');

      expect(mockVideoRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteVideo', () => {
    it('should delete video when exists', async () => {
      const existingVideo: VideoWithSubtitles = {
        id: '1',
        title: 'Test Video',
        videoUrl: 'https://example.com/video.mp4',
        createdAt: new Date(),
        updatedAt: new Date(),
        subtitles: [],
      };

      mockVideoRepository.findById.mockResolvedValue(existingVideo);
      mockVideoRepository.delete.mockResolvedValue();

      await videoUseCase.deleteVideo('1');

      expect(mockVideoRepository.findById).toHaveBeenCalledWith('1');
      expect(mockVideoRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when video not found', async () => {
      mockVideoRepository.findById.mockResolvedValue(null);

      await expect(videoUseCase.deleteVideo('999')).rejects.toThrow(
        'Video not found'
      );

      expect(mockVideoRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAllVideos', () => {
    it('should return all videos', async () => {
      const mockVideos = [
        {
          id: '1',
          title: 'Video 1',
          videoUrl: 'https://example.com/video1.mp4',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Video 2',
          videoUrl: 'https://example.com/video2.mp4',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockVideoRepository.findAll.mockResolvedValue(mockVideos);

      const result = await videoUseCase.getAllVideos();

      expect(mockVideoRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockVideos);
    });

    it('should return empty array when no videos', async () => {
      mockVideoRepository.findAll.mockResolvedValue([]);

      const result = await videoUseCase.getAllVideos();

      expect(result).toEqual([]);
    });
  });
});
