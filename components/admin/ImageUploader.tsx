'use client';

import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';

interface UploadedImage {
  url: string;
  file_id: string;
  thumbnail_url?: string;
  display_order: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList) {
    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push({
            url: data.url,
            file_id: data.fileId,
            thumbnail_url: data.thumbnailUrl,
            display_order: newImages.length,
          });
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      } catch {
        alert(`Failed to upload ${file.name}`);
      }
    }

    onChange(newImages);
    setUploading(false);
  }

  async function handleRemove(index: number) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    const img = images[index];
    setDeletingIndex(index);

    // Delete from ImageKit (best effort)
    try {
      await fetch(`/api/upload/image/${img.file_id}`, { method: 'DELETE' });
    } catch {
      // Continue anyway
    }

    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      display_order: i,
    }));
    onChange(updated);
    setDeletingIndex(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Images</label>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#F5F4F2]/10 rounded-lg p-8 text-center cursor-pointer hover:border-[#C79E3D]/40 transition-colors"
      >
        <Upload size={32} className="mx-auto mb-3 text-[#9AA0A6]" />
        <p className="text-[#9AA0A6] text-sm">
          {uploading ? 'Uploading...' : 'Click or drag images here'}
        </p>
        <p className="text-[#9AA0A6]/60 text-xs mt-1">Supports JPG, PNG, WebP</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.file_id}
              className="relative group rounded-lg overflow-hidden bg-[#2E2B23] aspect-[4/3]"
            >
              <img
                src={img.thumbnail_url || img.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {deletingIndex === index && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                disabled={deletingIndex !== null}
                className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Delete image"
              >
                <X size={14} />
              </button>
              <span className="absolute bottom-1.5 left-1.5 text-white text-[10px] bg-black/60 px-1.5 py-0.5 rounded">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
