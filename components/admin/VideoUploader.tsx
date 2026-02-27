'use client';

import { useState, useRef } from 'react';
import { Upload, X, Video } from 'lucide-react';

interface VideoUploaderProps {
  videoUrl: string | null;
  videoPublicId: string | null;
  onChange: (video: { url: string; publicId: string } | null) => void;
}

export default function VideoUploader({ videoUrl, videoPublicId, onChange }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);

    // Delete old video if exists
    if (videoPublicId) {
      try {
        await fetch(`/api/upload/video/${encodeURIComponent(videoPublicId)}`, { method: 'DELETE' });
      } catch {
        // Continue anyway
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange({ url: data.url, publicId: data.publicId });
      } else {
        alert('Failed to upload video');
      }
    } catch {
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (videoPublicId) {
      try {
        await fetch(`/api/upload/video/${encodeURIComponent(videoPublicId)}`, { method: 'DELETE' });
      } catch {
        // Continue anyway
      }
    }
    onChange(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Video (Optional)</label>

      {videoUrl ? (
        <div className="relative rounded-lg overflow-hidden bg-[#2E2B23]">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-64 object-contain bg-black"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#F6F5F3]/10 rounded-lg p-8 text-center cursor-pointer hover:border-[#C79E3D]/40 transition-colors"
        >
          {uploading ? (
            <>
              <Video size={32} className="mx-auto mb-3 text-[#C79E3D] animate-pulse" />
              <p className="text-[#9AA0A6] text-sm">Uploading video...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="mx-auto mb-3 text-[#9AA0A6]" />
              <p className="text-[#9AA0A6] text-sm">Click or drag a video file here</p>
              <p className="text-[#9AA0A6]/60 text-xs mt-1">Supports MP4, MOV, WebM</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}
