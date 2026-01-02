import { VideoRepository } from '@/infrastructure/repositories/VideoRepository';
import { VideoUseCase } from '@/application/use-cases/VideoUseCase';
import { NextRequest, NextResponse } from 'next/server';

const videoRepository = new VideoRepository();
const videoUseCase = new VideoUseCase(videoRepository);

// GET all videos
export async function GET() {
  try {
    const videos = await videoUseCase.getAllVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST create new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const video = await videoUseCase.createVideo(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create video' },
      { status: 400 }
    );
  }
}
