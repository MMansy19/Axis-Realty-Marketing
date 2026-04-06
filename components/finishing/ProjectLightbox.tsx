'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import type { FinishingMedia } from '@/lib/types/project';
import BeforeAfterSlider from './BeforeAfterSlider';

interface ProjectLightboxProps {
  media: FinishingMedia[];
  initialIndex: number;
  onClose: () => void;
  translations: {
    finishing_close: string;
    finishing_previous: string;
    finishing_next: string;
    finishing_before: string;
    finishing_after: string;
  };
}

export default function ProjectLightbox({ media, initialIndex, onClose, translations: t }: ProjectLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const touchStartX = useRef(0);

  const currentMedia = media[currentIndex];

  // Find matching before image for the current after image
  const beforeImage = currentMedia && !currentMedia.is_before
    ? media.find(m => m.type === 'image' && m.is_before)
    : null;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setShowBeforeAfter(false);
  }, [media.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setShowBeforeAfter(false);
  }, [media.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goNext, goPrev]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!currentMedia) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 text-white/70 hover:text-white transition-colors"
        aria-label={t.finishing_close}
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 text-white/60 text-sm">
        {currentIndex + 1} / {media.length}
      </div>

      {/* Before/After toggle button */}
      {beforeImage && currentMedia.type === 'image' && !currentMedia.is_before && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowBeforeAfter(!showBeforeAfter); }}
          className="absolute top-5 left-4 z-50 px-4 py-2 bg-[#C79E3D]/90 text-[#0B0F14] text-sm font-medium rounded-sm hover:bg-[#C79E3D] transition-colors"
        >
          {showBeforeAfter ? t.finishing_after : `${t.finishing_before} / ${t.finishing_after}`}
        </button>
      )}

      {/* Main content area */}
      <div
        className="relative w-full h-full flex items-center justify-center px-4 sm:px-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {showBeforeAfter && beforeImage ? (
          <div className="w-full max-w-4xl aspect-[4/3]">
            <BeforeAfterSlider
              beforeImage={beforeImage.url}
              afterImage={currentMedia.url}
              beforeLabel={t.finishing_before}
              afterLabel={t.finishing_after}
            />
          </div>
        ) : currentMedia.type === 'image' ? (
          <div className="relative w-full max-w-5xl aspect-[4/3]">
            <Image
              src={currentMedia.url}
              alt={`Project media ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        ) : (
          <div className="relative w-full max-w-5xl aspect-video">
            <video
              src={currentMedia.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/60 hover:text-white transition-colors"
            aria-label={t.finishing_previous}
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/60 hover:text-white transition-colors"
            aria-label={t.finishing_next}
          >
            <ChevronRight size={36} />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-[90vw] overflow-x-auto px-4 pb-2">
          {media.map((m, idx) => (
            <button
              key={m.id}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setShowBeforeAfter(false); }}
              className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-[#C79E3D] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {m.type === 'image' ? (
                <Image
                  src={m.thumbnail_url || m.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play size={16} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
