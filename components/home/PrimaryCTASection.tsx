'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface PrimaryCTASectionProps {
  translations: {
    primary_cta_headline: string;
    primary_cta_subheadline: string;
    cta_schedule: string;
  };
}

export default function PrimaryCTASection({ translations: t }: PrimaryCTASectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[var(--brand-bg)] py-24 sm:py-32 relative" ref={ref}>
      {/* Subtle gold border accent */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--brand-accent)]/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--brand-accent)]/30 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          className="w-[2px] h-12 bg-[var(--brand-accent)] mx-auto mb-10"
          initial={{ height: 0, opacity: 0 }}
          animate={isInView ? { height: 48, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        />

        <motion.h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--brand-text)] tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t.primary_cta_headline}
        </motion.h2>

        <motion.p
          className="mt-6 text-[var(--brand-muted)] text-base sm:text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          {t.primary_cta_subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="#contact"
            className="block sm:inline-block mt-10 px-10 py-4 bg-[var(--brand-accent)] text-[var(--brand-bg)] font-semibold tracking-wide text-sm sm:text-base hover:bg-[var(--brand-accent)]/90 transition-all duration-300 text-center"
          >
            {t.cta_schedule}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
