'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  locale: string;
  translations: {
    hero_headline_1: string;
    hero_headline_2: string;
    hero_subheadline: string;
    cta_strategy_call: string;
    cta_view_projects: string;
  };
}

export default function HeroSection({ locale, translations: t }: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* Background Image with Slow Zoom */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animate-slow-zoom">
          <Image
            src="/bg/hero-bg.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={75}
          />
        </div>

        {/* Cinematic Dark Overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: 'rgba(11, 15, 20, 0.72)' }}
        />

        {/* Subtle Blur Layer */}
        <div
          className="absolute inset-0 z-[2]"
          style={{ backdropFilter: 'blur(1.5px)' }}
        />

        {/* Cinematic Vignette */}
        <div
          className="absolute inset-0 z-[3]"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(11, 15, 20, 0.6) 100%)',
          }}
        />

        {/* Directional Light Gradient — Left Side Emphasis */}
        <div
          className="absolute inset-0 z-[4]"
          style={{
            background:
              'linear-gradient(105deg, rgba(199, 158, 61, 0.04) 0%, transparent 50%, rgba(11, 15, 20, 0.3) 100%)',
          }}
        />
      </div>

      {/* Animated Vertical Gold Line — Axis Visual Signature */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[1px] z-20 origin-top"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--brand-accent) 30%, var(--brand-accent) 70%, transparent)',
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 100, opacity: 0.6 }}
        transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
      />

      {/* Content — Centered */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex justify-center">
        <div className="max-w-3xl text-center flex flex-col items-center">
          {/* Accent Line Above Headline */}
          <motion.div
            className="w-12 h-[2px] bg-[var(--brand-accent)] mb-8"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight text-[var(--brand-text)] leading-[1.05] break-words">
              <span className="block">{t.hero_headline_1}</span>
              <motion.span
                className="block text-[var(--brand-accent)] mt-1"
                initial={{ opacity: 0, x: locale === 'ar' ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 1.1, ease: 'easeOut' }}
              >
                {t.hero_headline_2}
              </motion.span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-[var(--brand-text)]/70 mt-6 sm:mt-8 max-w-xl font-light leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            {t.hero_subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 sm:mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <a
              href="#contact"
              className="group relative px-8 py-4 bg-[var(--brand-accent)] text-[var(--brand-bg)] font-semibold tracking-wider text-sm uppercase overflow-hidden transition-all duration-300 w-full sm:w-auto text-center"
            >
              <span className="relative z-10">{t.cta_strategy_call}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <a
              href="#projects"
              className="px-8 py-4 bg-transparent border border-[var(--brand-text)]/20 text-[var(--brand-text)] font-medium tracking-wider text-sm uppercase hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-all duration-500 w-full sm:w-auto text-center"
            >
              {t.cta_view_projects}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-[var(--brand-accent)]/60" />
        </motion.div>
      </motion.div>

      {/* Bottom Fade into Next Section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--brand-bg)] via-[var(--brand-bg)]/50 to-transparent z-20" />
    </section>
  );
}
