'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import Image from 'next/image';
import { projects } from '@/data/projects';
import type { ProjectStatus } from '@/lib/types/project';

interface ProjectsSectionProps {
  locale: string;
  translations: {
    projects_headline: string;
    project_status_launching: string;
    project_status_selling: string;
    project_status_sold_out: string;
    project_status_construction: string;
    view_case_study: string;
  };
}

const statusStyles: Record<ProjectStatus, string> = {
  launching: 'bg-[var(--brand-accent)]/20 text-[var(--brand-accent)] border-[var(--brand-accent)]/30',
  selling: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  sold_out: 'bg-[var(--brand-muted)]/20 text-[var(--brand-muted)] border-[var(--brand-muted)]/30',
  construction: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function ProjectsSection({ locale, translations: t }: ProjectsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isAr = locale === 'ar';

  const statusLabels: Record<ProjectStatus, string> = {
    launching: t.project_status_launching,
    selling: t.project_status_selling,
    sold_out: t.project_status_sold_out,
    construction: t.project_status_construction,
  };

  const featured = projects[0];
  const rest = projects.slice(1);

  // Map project images — first 4 images available
  const projectImages: Record<string, string> = {
    [projects[0]?.id]: '/bg/image-0.webp',
    [projects[1]?.id]: '/bg/image-1.webp',
    [projects[2]?.id]: '/bg/image-2.webp',
    [projects[3]?.id]: '/bg/image-3.webp',
  };

  return (
    <section className="bg-[var(--brand-rich-gray)] py-24 sm:py-32" id="projects" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            className="w-[2px] h-10 bg-[var(--brand-accent)] mx-auto mb-8"
            initial={{ height: 0, opacity: 0 }}
            animate={isInView ? { height: 40, opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          />
          <motion.h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.projects_headline}
          </motion.h2>
        </div>

        {/* Featured Project */}
        <motion.div
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/7] bg-[var(--brand-bg)] overflow-hidden mb-8 group"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Image
            src="/bg/hero-bg.webp"
            alt={isAr ? featured.name_ar : featured.name_en}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            quality={75}
            priority
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12 z-10">
            <span className={`inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase border ${statusStyles[featured.status]} mb-4`}>
              {statusLabels[featured.status]}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--brand-text)] mb-2">
              {isAr ? featured.name_ar : featured.name_en}
            </h3>
            <p className="text-[var(--brand-muted)] text-sm mb-1">
              {isAr ? featured.location_ar : featured.location_en}
            </p>
            <p className="text-[var(--brand-text)]/70 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
              {isAr ? featured.summary_ar : featured.summary_en}
            </p>
            {featured.case_study_slug && (
              <a
                href={`#case-studies`}
                className="inline-block mt-6 text-[var(--brand-accent)] text-sm font-medium tracking-wider uppercase hover:text-[var(--brand-accent)]/80 transition-colors"
              >
                {t.view_case_study} {isAr ? '←' : '→'}
              </a>
            )}
          </div>
        </motion.div>

        {/* Remaining Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rest.map((project, i) => (
            <motion.div
              key={project.id}
              className="relative bg-[var(--brand-bg)] overflow-hidden group aspect-[4/3]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              {projectImages[project.id] ? (
                <Image
                  src={projectImages[project.id]}
                  alt={isAr ? project.name_ar : project.name_en}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={75}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-surface)] to-[var(--brand-bg)]" />
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase border ${statusStyles[project.status]} mb-3`}>
                  {statusLabels[project.status]}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--brand-text)] mb-1">
                  {isAr ? project.name_ar : project.name_en}
                </h3>
                <p className="text-[var(--brand-muted)] text-xs">
                  {isAr ? project.location_ar : project.location_en}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
