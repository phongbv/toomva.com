'use client';

import { useState, useEffect } from 'react';
import { AddVideoForm } from '@/components/AddVideoForm';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoAdded = () => {
    setShowAddForm(false);
    fetchVideos();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold">TV Learning Platform</h1>
          <p className="text-gray-600 mt-1">Learn languages by watching videos with dual subtitles</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Hide Form' : 'Add New Video'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8">
            <AddVideoForm onVideoAdded={handleVideoAdded} />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-6">Video Library</h2>
          
          {isLoading ? (
            <div className="text-center py-12">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No videos yet. Add your first video to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Link key={video.id} href={`/watch/${video.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                          <span className="text-gray-400">No thumbnail</span>
                        </div>
                      )}
                      <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Added: {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
