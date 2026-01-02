import { VideoRepository } from '@/infrastructure/repositories/VideoRepository';
import { VideoUseCase } from '@/application/use-cases/VideoUseCase';
import { NextRequest, NextResponse } from 'next/server';

const videoRepository = new VideoRepository();
const videoUseCase = new VideoUseCase(videoRepository);

// GET single video by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await videoUseCase.getVideoById(id);
    
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// PUT update video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const video = await videoUseCase.updateVideo(id, body);
    return NextResponse.json(video);
  } catch (error: any) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update video' },
      { status: 400 }
    );
  }
}

// DELETE video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await videoUseCase.deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 400 }
    );
  }
}
