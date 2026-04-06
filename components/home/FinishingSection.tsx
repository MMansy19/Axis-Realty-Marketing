'use client';

import { motion, useInView, animate } from 'motion/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, MapPin } from 'lucide-react';
import Image from 'next/image';

interface FinishingSectionProps {
  locale: string;
  translations: {
    finishing_headline: string;
    finishing_subheadline: string;
    finishing_stat_buildings: string;
    finishing_stat_buildings_label: string;
    finishing_locations_title: string;
    finishing_location_dreamland: string;
    finishing_location_zayed: string;
    finishing_location_san_capital: string;
    finishing_cta: string;
    finishing_view_all: string;
  };
  featuredMedia?: { url: string; thumbnail_url?: string; type: 'image' | 'video' }[];
}

function AnimatedCounter({ value, inView }: { value: number; inView: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span>{display}</span>;
}

export default function FinishingSection({ locale, translations: t, featuredMedia = [] }: FinishingSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isAr = locale === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const locations = [
    { name: t.finishing_location_dreamland, icon: '🏙️' },
    { name: t.finishing_location_zayed, icon: '🌆' },
    { name: t.finishing_location_san_capital, icon: '🏗️' },
  ];

  const nextSlide = useCallback(() => {
    if (featuredMedia.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredMedia.length);
  }, [featuredMedia.length]);

  const prevSlide = useCallback(() => {
    if (featuredMedia.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + featuredMedia.length) % featuredMedia.length);
  }, [featuredMedia.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (isAr ? diff < 0 : diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section
      className="relative bg-[var(--brand-bg)] py-24 sm:py-32 overflow-hidden"
      id="finishing"
      ref={ref}
    >
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-accent)]/[0.02] via-transparent to-[var(--brand-accent)]/[0.02]" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            className="w-[2px] h-10 bg-[var(--brand-accent)] mx-auto mb-8"
            initial={{ height: 0, opacity: 0 }}
            animate={isInView ? { height: 40, opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          />
          <motion.h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.finishing_headline}
          </motion.h2>
          <motion.p
            className="text-[var(--brand-muted)] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {t.finishing_subheadline}
          </motion.p>
        </div>

        {/* Stats + Locations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16 sm:mb-20">
          {/* Stat Counter Card */}
          <motion.div
            className="relative bg-[var(--brand-surface)] border border-[var(--brand-accent)]/10 p-8 sm:p-10 backdrop-blur-sm"
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {/* Glassmorphism accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-accent)] to-transparent" />

            <div className="text-center">
              <div className="font-serif text-6xl sm:text-7xl md:text-8xl font-bold text-[var(--brand-accent)] mb-3">
                <AnimatedCounter value={parseInt(t.finishing_stat_buildings)} inView={isInView} />
              </div>
              <p className="text-[var(--brand-text)] text-lg sm:text-xl font-medium tracking-wide">
                {t.finishing_stat_buildings_label}
              </p>
            </div>
          </motion.div>

          {/* Locations Card */}
          <motion.div
            className="relative bg-[var(--brand-surface)] border border-[var(--brand-accent)]/10 p-8 sm:p-10 backdrop-blur-sm"
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-accent)] to-transparent" />

            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--brand-text)] mb-8 flex items-center gap-3">
              <MapPin size={20} className="text-[var(--brand-accent)]" />
              {t.finishing_locations_title}
            </h3>

            <div className="space-y-4">
              {locations.map((loc, i) => (
                <motion.div
                  key={loc.name}
                  className="flex items-center gap-4 p-3 bg-[var(--brand-bg)]/50 border border-[var(--brand-light)]/5 transition-colors hover:border-[var(--brand-accent)]/20"
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                >
                  <span className="text-2xl">{loc.icon}</span>
                  <span className="text-[var(--brand-text)] text-sm sm:text-base font-medium tracking-wide">
                    {loc.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Media Slider */}
        {featuredMedia.length > 0 && (
          <motion.div
            className="mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div
              className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-[var(--brand-surface)]"
              ref={sliderRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {featuredMedia.map((media, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={`Finishing project ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1200px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <Image
                        src={media.thumbnail_url || media.url}
                        alt={`Finishing project video ${idx + 1}`}
                        fill
                        className="object-cover opacity-60"
                        sizes="(max-width: 768px) 100vw, 1200px"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--brand-accent)]/90 flex items-center justify-center backdrop-blur-sm">
                          <Play size={28} className="text-[var(--brand-bg)] ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Navigation arrows */}
              {featuredMedia.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-[var(--brand-bg)]/60 backdrop-blur-sm text-[var(--brand-text)] hover:bg-[var(--brand-accent)]/80 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-[var(--brand-bg)]/60 backdrop-blur-sm text-[var(--brand-text)] hover:bg-[var(--brand-accent)]/80 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Dots */}
              {featuredMedia.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {featuredMedia.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? 'bg-[var(--brand-accent)] w-6'
                          : 'bg-[var(--brand-text)]/40 hover:bg-[var(--brand-text)]/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <a
            href="https://wa.me/201037217638"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 sm:px-12 py-4 bg-[var(--brand-accent)] text-[var(--brand-bg)] font-semibold text-sm sm:text-base tracking-wide hover:bg-[var(--brand-accent)]/90 transition-all duration-300 mb-6"
          >
            {t.finishing_cta}
          </a>

          <div>
            <a
              href={`/${locale}/projects/finishing`}
              className="inline-block px-8 py-3 border border-[var(--brand-text)]/20 text-[var(--brand-text)] text-sm font-medium tracking-wider uppercase hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-all duration-300"
            >
              {t.finishing_view_all} →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
