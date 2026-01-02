import { VideoPlayerPage } from '@/components/VideoPlayerPage';

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VideoPlayerPage videoId={id} />;
}
