"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Blog } from '@/lib/types/blog';
import BlogImageLightbox from '@/components/blog/BlogImageLightbox';

interface BlogCardProps {
  blog: Blog;
  locale: string;
  translations?: {
    blog_no_image: string;
    blog_has_video: string;
  };
}

export default function BlogCard({ blog, locale, translations }: BlogCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const title = locale === 'ar' ? blog.title_ar : blog.title_en;
  const galleryImages = blog.blog_images || [];
  const coverImage = galleryImages[0];
  const noImageText = translations?.blog_no_image ?? 'No image';
  const hasVideoText = translations?.blog_has_video ?? 'Includes video';

  return (
    <>
      <div className="group block bg-[var(--brand-bg)] rounded-sm overflow-hidden border border-[var(--brand-light)]/5 hover:border-[var(--brand-accent)]/30 transition-all duration-500 hover:-translate-y-2 shadow-lg">
        <button
          type="button"
          className="relative h-48 sm:h-64 w-full overflow-hidden bg-[var(--brand-olive)] text-left"
          onClick={() => {
            if (galleryImages.length > 0) {
              setLightboxIndex(0);
            }
          }}
          aria-label={galleryImages.length > 0 ? `Open gallery for ${title}` : title}
        >
          {coverImage ? (
            <Image
              src={coverImage.thumbnail_url || coverImage.url}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--brand-muted)]">
              {noImageText}
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          {blog.video_url && (
            <span className={`absolute top-2 text-xs text-[var(--brand-accent)] bg-[var(--brand-accent)]/30 px-2 py-1 rounded ${locale === 'ar' ? 'right-2' : 'left-2'}`}>
              🎬 {hasVideoText}
            </span>
          )}
        </button>

        <div className="p-6">
          <Link href={`/blog/${blog.slug}`}>
            <h3 className="font-serif text-xl font-bold text-[var(--brand-text)] line-clamp-2 leading-relaxed hover:text-[var(--brand-accent)] transition-colors">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {lightboxIndex !== null && galleryImages.length > 0 && (
        <BlogImageLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
