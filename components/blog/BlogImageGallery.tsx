'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { BlogImage } from '@/lib/types/blog';
import BlogImageLightbox from './BlogImageLightbox';

interface BlogImageGalleryProps {
  images: BlogImage[];
  title: string;
}

export default function BlogImageGallery({ images, title }: BlogImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        {/* Hero image */}
        <div
          className="relative w-full aspect-[16/9] rounded-sm overflow-hidden cursor-pointer"
          onClick={() => setLightboxIndex(0)}
        >
          <Image
            src={images[0].url}
            alt={title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>

        {/* Additional images */}
        {images.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {images.slice(1).map((img, idx) => (
              <div
                key={img.id}
                className="relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(idx + 1)}
              >
                <Image
                  src={img.url}
                  alt={title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <BlogImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
