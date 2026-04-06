'use client';

import { useState, useMemo } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { MapPin, Maximize2, Play, Calendar, Ruler } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { FinishingProject, FinishingMedia, PropertyType } from '@/lib/types/project';

const ProjectLightbox = dynamic(() => import('./ProjectLightbox'), { ssr: false });

interface ProjectGalleryProps {
  locale: string;
  projects: FinishingProject[];
  translations: {
    finishing_filter_all: string;
    finishing_filter_apartment: string;
    finishing_filter_villa: string;
    finishing_filter_building: string;
    finishing_area_sqm: string;
    finishing_completed: string;
    finishing_before: string;
    finishing_after: string;
    finishing_close: string;
    finishing_previous: string;
    finishing_next: string;
    finishing_no_projects: string;
  };
}

export default function ProjectGallery({ locale, projects, translations: t }: ProjectGalleryProps) {
  const [filter, setFilter] = useState<PropertyType | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [lightboxProject, setLightboxProject] = useState<FinishingProject | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const isAr = locale === 'ar';

  // Get unique locations
  const locations = useMemo(() => {
    const locs = new Set<string>();
    projects.forEach(p => {
      const loc = isAr ? p.location_ar : p.location_en;
      if (loc) locs.add(loc);
    });
    return Array.from(locs);
  }, [projects, isAr]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filter !== 'all' && p.property_type !== filter) return false;
      if (locationFilter !== 'all') {
        const loc = isAr ? p.location_ar : p.location_en;
        if (loc !== locationFilter) return false;
      }
      return true;
    });
  }, [projects, filter, locationFilter, isAr]);

  const filterButtons: { key: PropertyType | 'all'; label: string }[] = [
    { key: 'all', label: t.finishing_filter_all },
    { key: 'apartment', label: t.finishing_filter_apartment },
    { key: 'villa', label: t.finishing_filter_villa },
    { key: 'building', label: t.finishing_filter_building },
  ];

  function openLightbox(project: FinishingProject, index: number) {
    setLightboxProject(project);
    setLightboxIndex(index);
  }

  return (
    <div ref={ref}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-xs sm:text-sm tracking-wider uppercase font-medium transition-all duration-300 border ${
                filter === key
                  ? 'text-[var(--brand-accent)] border-[var(--brand-accent)] bg-[var(--brand-accent)]/10'
                  : 'text-[var(--brand-muted)] border-[var(--brand-light)]/10 hover:text-[var(--brand-text)] hover:border-[var(--brand-accent)]/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Location filter */}
        {locations.length > 0 && (
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-[var(--brand-surface)] border border-[var(--brand-light)]/10 text-[var(--brand-text)] text-sm px-4 py-2 focus:outline-none focus:border-[var(--brand-accent)]/50"
          >
            <option value="all">{t.finishing_filter_all} Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        )}
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--brand-muted)] text-lg">{t.finishing_no_projects}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, i) => {
            const media = project.finishing_media || [];
            const images = media.filter(m => m.type === 'image' && !m.is_before);
            const hasVideo = media.some(m => m.type === 'video');
            const hasBefore = media.some(m => m.is_before);
            const title = isAr ? project.title_ar : project.title_en;
            const location = isAr ? project.location_ar : project.location_en;

            return (
              <motion.div
                key={project.id}
                className="group bg-[var(--brand-surface)] border border-[var(--brand-light)]/5 overflow-hidden hover:border-[var(--brand-accent)]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                {/* Cover image */}
                <div
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(project, 0)}
                >
                  {project.cover_image_url ? (
                    <Image
                      src={project.cover_image_url}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--brand-bg)] flex items-center justify-center text-[var(--brand-muted)]">
                      No image
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        {images.length > 1 && (
                          <span className="text-xs text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            {images.length} photos
                          </span>
                        )}
                        {hasVideo && (
                          <span className="flex items-center gap-1 text-xs text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            <Play size={12} /> Video
                          </span>
                        )}
                        {hasBefore && (
                          <span className="text-xs text-[#C79E3D] bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            B/A
                          </span>
                        )}
                      </div>
                      <Maximize2 size={18} className="text-white/80" />
                    </div>
                  </div>

                  {/* Type badge */}
                  {project.property_type && (
                    <span className="absolute top-3 left-3 text-xs text-[var(--brand-bg)] bg-[var(--brand-accent)]/90 px-3 py-1 font-medium tracking-wider uppercase backdrop-blur-sm">
                      {project.property_type === 'apartment' ? t.finishing_filter_apartment
                        : project.property_type === 'villa' ? t.finishing_filter_villa
                        : t.finishing_filter_building}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-serif text-lg font-semibold text-[var(--brand-text)] mb-2 line-clamp-1">
                    {title}
                  </h3>

                  <div className="space-y-1.5">
                    {location && (
                      <p className="flex items-center gap-2 text-[var(--brand-muted)] text-sm">
                        <MapPin size={14} className="flex-shrink-0 text-[var(--brand-accent)]" />
                        {location}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[var(--brand-muted)] text-xs">
                      {project.area && (
                        <span className="flex items-center gap-1.5">
                          <Ruler size={13} />
                          {project.area} {t.finishing_area_sqm}
                        </span>
                      )}
                      {project.completion_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {new Date(project.completion_date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxProject && lightboxProject.finishing_media && lightboxProject.finishing_media.length > 0 && (
        <ProjectLightbox
          media={lightboxProject.finishing_media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxProject(null)}
          translations={{
            finishing_close: t.finishing_close,
            finishing_previous: t.finishing_previous,
            finishing_next: t.finishing_next,
            finishing_before: t.finishing_before,
            finishing_after: t.finishing_after,
          }}
        />
      )}
    </div>
  );
}
