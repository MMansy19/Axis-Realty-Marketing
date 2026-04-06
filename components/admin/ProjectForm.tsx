'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import type { FinishingProject } from '@/lib/types/project';

interface UploadedMedia {
  type: 'image' | 'video';
  url: string;
  file_id?: string;
  public_id?: string;
  thumbnail_url?: string;
  is_before: boolean;
  display_order: number;
}

interface ProjectFormProps {
  project?: FinishingProject;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const isEditing = !!project;
  const router = useRouter();

  const [titleEn, setTitleEn] = useState(project?.title_en || '');
  const [titleAr, setTitleAr] = useState(project?.title_ar || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [descriptionEn, setDescriptionEn] = useState(project?.description_en || '');
  const [descriptionAr, setDescriptionAr] = useState(project?.description_ar || '');
  const [locationEn, setLocationEn] = useState(project?.location_en || '');
  const [locationAr, setLocationAr] = useState(project?.location_ar || '');
  const [propertyType, setPropertyType] = useState(project?.property_type || '');
  const [area, setArea] = useState(project?.area?.toString() || '');
  const [completionDate, setCompletionDate] = useState(project?.completion_date || '');
  const [isPublished, setIsPublished] = useState(project?.is_published ?? false);
  const [displayOrder, setDisplayOrder] = useState(project?.display_order ?? 0);

  // Separate images into before/after
  const existingImages = (project?.finishing_media || [])
    .filter(m => m.type === 'image')
    .map(m => ({
      url: m.url,
      file_id: m.file_id || '',
      thumbnail_url: m.thumbnail_url || undefined,
      display_order: m.display_order,
    }));

  const existingBeforeImages = (project?.finishing_media || [])
    .filter(m => m.type === 'image' && m.is_before)
    .map(m => ({
      url: m.url,
      file_id: m.file_id || '',
      thumbnail_url: m.thumbnail_url || undefined,
      display_order: m.display_order,
    }));

  const existingAfterImages = (project?.finishing_media || [])
    .filter(m => m.type === 'image' && !m.is_before)
    .map(m => ({
      url: m.url,
      file_id: m.file_id || '',
      thumbnail_url: m.thumbnail_url || undefined,
      display_order: m.display_order,
    }));

  const existingVideo = (project?.finishing_media || []).find(m => m.type === 'video');

  const [beforeImages, setBeforeImages] = useState<{ url: string; file_id: string; thumbnail_url?: string; display_order: number }[]>(existingBeforeImages);
  const [afterImages, setAfterImages] = useState<{ url: string; file_id: string; thumbnail_url?: string; display_order: number }[]>(
    existingAfterImages.length > 0 ? existingAfterImages : existingImages.filter(img => !existingBeforeImages.some(bi => bi.file_id === img.file_id))
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(existingVideo?.url || null);
  const [videoPublicId, setVideoPublicId] = useState<string | null>(existingVideo?.public_id || null);

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

    // Build media array from before + after images + video
    const media: UploadedMedia[] = [];

    beforeImages.forEach((img, idx) => {
      media.push({
        type: 'image',
        url: img.url,
        file_id: img.file_id,
        is_before: true,
        thumbnail_url: img.thumbnail_url,
        display_order: idx,
      });
    });

    afterImages.forEach((img, idx) => {
      media.push({
        type: 'image',
        url: img.url,
        file_id: img.file_id,
        is_before: false,
        thumbnail_url: img.thumbnail_url,
        display_order: beforeImages.length + idx,
      });
    });

    if (videoUrl && videoPublicId) {
      media.push({
        type: 'video',
        url: videoUrl,
        public_id: videoPublicId,
        is_before: false,
        display_order: media.length,
      });
    }

    // Use first after image as cover, or first before image
    const coverImage = afterImages[0] || beforeImages[0];

    const payload = {
      title_en: titleEn.trim(),
      title_ar: titleAr.trim(),
      slug: slug.trim(),
      description_en: descriptionEn.trim() || null,
      description_ar: descriptionAr.trim() || null,
      location_en: locationEn.trim() || null,
      location_ar: locationAr.trim() || null,
      property_type: propertyType || null,
      area: area ? parseFloat(area) : null,
      completion_date: completionDate || null,
      cover_image_url: coverImage?.url || null,
      cover_image_file_id: coverImage?.file_id || null,
      is_published: isPublished,
      display_order: displayOrder,
      media,
    };

    try {
      const url = isEditing ? `/api/finishing-projects/${project.id}` : '/api/finishing-projects';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/dashboard?tab=projects');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save project');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full bg-[#1A1D21] border border-[#F5F4F2]/10 rounded-sm px-4 py-3 text-[#F5F4F2] text-sm focus:outline-none focus:border-[#C79E3D]/50 transition-colors placeholder:text-[#9AA0A6]/50';
  const labelClass = 'block text-[#F5F4F2]/80 text-sm font-medium mb-2';

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/dashboard?tab=projects')}
            className="p-2.5 text-[#9AA0A6] hover:text-[#C79E3D] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F4F2]">
            {isEditing ? 'Edit Project' : 'New Finishing Project'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Title (English) *</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  className={inputClass}
                  placeholder="Luxury Apartment Finishing"
                />
              </div>
              <div>
                <label className={labelClass}>Title (Arabic) *</label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className={inputClass}
                  dir="rtl"
                  placeholder="تشطيب شقة فاخرة"
                />
              </div>
              <div>
                <label className={labelClass}>
                  Slug *
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setAutoSlug(!autoSlug)}
                      className="ml-2 text-xs text-[#C79E3D]"
                    >
                      {autoSlug ? '(auto)' : '(manual)'}
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
                  className={inputClass}
                  placeholder="luxury-apartment-finishing"
                />
              </div>
              <div>
                <label className={labelClass}>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="building">Building</option>
                </select>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-6">Description</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Description (English)</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Full apartment finishing with premium materials..."
                />
              </div>
              <div>
                <label className={labelClass}>Description (Arabic)</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={4}
                  className={inputClass}
                  dir="rtl"
                  placeholder="تشطيب كامل للشقة بأجود الخامات..."
                />
              </div>
            </div>
          </section>

          {/* Location & Details */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-6">Location & Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Location (English)</label>
                <input
                  type="text"
                  value={locationEn}
                  onChange={(e) => setLocationEn(e.target.value)}
                  className={inputClass}
                  placeholder="Sheikh Zayed, Giza"
                />
              </div>
              <div>
                <label className={labelClass}>Location (Arabic)</label>
                <input
                  type="text"
                  value={locationAr}
                  onChange={(e) => setLocationAr(e.target.value)}
                  className={inputClass}
                  dir="rtl"
                  placeholder="الشيخ زايد، الجيزة"
                />
              </div>
              <div>
                <label className={labelClass}>Area (sqm)</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={inputClass}
                  placeholder="150"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>Completion Date</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* After Images (main gallery) */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-2">After Images (Completed Work)</h2>
            <p className="text-[#9AA0A6] text-sm mb-6">Upload photos of the finished project. The first image will be used as cover.</p>
            <ImageUploader images={afterImages} onChange={setAfterImages} />
          </section>

          {/* Before Images (optional) */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-2">Before Images (Optional)</h2>
            <p className="text-[#9AA0A6] text-sm mb-6">Upload photos of the space before finishing for before/after comparison.</p>
            <ImageUploader images={beforeImages} onChange={setBeforeImages} />
          </section>

          {/* Video */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-6">Video (Optional)</h2>
            <VideoUploader
              videoUrl={videoUrl}
              videoPublicId={videoPublicId}
              onChange={(video) => {
                if (video) { setVideoUrl(video.url); setVideoPublicId(video.publicId); }
                else { setVideoUrl(null); setVideoPublicId(null); }
              }}
            />
          </section>

          {/* Publishing */}
          <section className="bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-6">
            <h2 className="text-lg font-semibold text-[#F5F4F2] mb-6">Publishing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className={inputClass}
                  min="0"
                />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPublished ? 'bg-[#C79E3D]' : 'bg-[#F5F4F2]/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      isPublished ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-[#F5F4F2]/80">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard?tab=projects')}
              className="px-6 py-3 text-sm text-[#9AA0A6] hover:text-[#F5F4F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-[#C79E3D] text-[#0B0F14] font-medium rounded-sm transition-colors text-sm hover:bg-[#C79E3D]/90 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
