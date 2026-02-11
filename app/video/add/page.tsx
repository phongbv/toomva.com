'use client';
import { AddVideoForm } from "@/components/AddVideoForm";
import { useRouter } from 'next/navigation';

export default function AddVideoPage() {
  const router = useRouter();
  function handleVideoAdded(): void {
    router.push('/')
  }

  return (
    <div className="mb-8">
      <AddVideoForm onVideoAdded={handleVideoAdded} />
    </div>
  );
}
