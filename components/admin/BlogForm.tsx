'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import type { Blog } from '@/lib/types/blog';

interface UploadedImage {
  url: string;
  file_id: string;
  thumbnail_url?: string;
  display_order: number;
}

interface BlogFormProps {
  blog?: Blog;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function BlogForm({ blog }: BlogFormProps) {
  const isEditing = !!blog;
  const router = useRouter();

  const [titleEn, setTitleEn] = useState(blog?.title_en || '');
  const [titleAr, setTitleAr] = useState(blog?.title_ar || '');
  const [slug, setSlug] = useState(blog?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [isPublished, setIsPublished] = useState(blog?.is_published ?? true);
  const [displayOrder, setDisplayOrder] = useState(blog?.display_order ?? 0);
  const [images, setImages] = useState<UploadedImage[]>(
    blog?.blog_images?.map((img) => ({
      url: img.url,
      file_id: img.file_id,
      thumbnail_url: img.thumbnail_url || undefined,
      display_order: img.display_order,
    })) || []
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(blog?.video_url || null);
  const [videoPublicId, setVideoPublicId] = useState<string | null>(blog?.video_public_id || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEn.trim() || !titleAr.trim() || !slug.trim()) {
      setError('Title (EN), Title (AR), and Slug are required');
      return;
    }

    setError('');
    setSaving(true);

    const payload = {
      title_en: titleEn.trim(),
      title_ar: titleAr.trim(),
      slug: slug.trim(),
      video_url: videoUrl,
      video_public_id: videoPublicId,
      is_published: isPublished,
      display_order: displayOrder,
      images: images.map((img, idx) => ({
        url: img.url,
        file_id: img.file_id,
        thumbnail_url: img.thumbnail_url || null,
        display_order: idx,
      })),
    };

    try {
      const url = isEditing ? `/api/blogs/${blog.id}` : '/api/blogs';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save blog');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2.5 text-[#9AA0A6] hover:text-[#F5F4F2] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F4F2]">
            {isEditing ? 'Edit Blog' : 'New Blog'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Title EN */}
          <div className="space-y-2">
            <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Title (English)</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => handleTitleEnChange(e.target.value)}
              className="w-full bg-[#2E2B23] border border-[#F5F4F2]/10 rounded-sm px-4 py-3 text-[#F5F4F2] focus:outline-none focus:border-[#C79E3D] transition-colors"
              placeholder="Blog title in English"
              required
            />
          </div>

          {/* Title AR */}
          <div className="space-y-2">
            <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Title (Arabic)</label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full bg-[#2E2B23] border border-[#F5F4F2]/10 rounded-sm px-4 py-3 text-[#F5F4F2] focus:outline-none focus:border-[#C79E3D] transition-colors text-right"
              dir="rtl"
              placeholder="ط¹ظ†ظˆط§ظ† ط§ظ„ظ…ط¯ظˆظ†ط© ط¨ط§ظ„ط¹ط±ط¨ظٹط©"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Slug</label>
              {!isEditing && (
                <label className="flex items-center gap-2 text-xs text-[#9AA0A6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="rounded border-[#F5F4F2]/10 bg-[#2E2B23]"
                  />
                  Auto from title
                </label>
              )}
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#2E2B23] border border-[#F5F4F2]/10 rounded-sm px-4 py-3 text-[#F5F4F2] focus:outline-none focus:border-[#C79E3D] transition-colors font-mono text-sm"
              placeholder="blog-slug"
              required
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full bg-[#2E2B23] border border-[#F5F4F2]/10 rounded-sm px-4 py-3 text-[#F5F4F2] focus:outline-none focus:border-[#C79E3D] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#9AA0A6] uppercase tracking-wider">Status</label>
              <div
                onClick={() => setIsPublished(!isPublished)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm border cursor-pointer transition-colors ${
                  isPublished
                    ? 'border-green-400/30 bg-green-400/10 text-green-400'
                    : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${isPublished ? 'bg-green-400' : 'bg-yellow-400'}`} />
                {isPublished ? 'Published' : 'Draft'}
              </div>
            </div>
          </div>

          {/* Image Uploader */}
          <ImageUploader images={images} onChange={setImages} />

          {/* Video Uploader */}
          <VideoUploader
            videoUrl={videoUrl}
            videoPublicId={videoPublicId}
            onChange={(video) => {
              setVideoUrl(video?.url || null);
              setVideoPublicId(video?.publicId || null);
            }}
          />

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-sm p-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#C79E3D] hover:bg-[#C79E3D]/90 text-[#0B0F14] font-medium py-4 rounded-sm transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : isEditing ? 'Update Blog' : 'Create Blog'}
          </button>
        </form>
      </div>
    </div>
  );
}
