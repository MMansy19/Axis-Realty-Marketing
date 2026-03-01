'use client';

import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';

interface PositioningSectionProps {
  translations: {
    positioning_headline: string;
    positioning_body: string;
  };
}

export default function PositioningSection({ translations: t }: PositioningSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-[var(--brand-light)] py-16 sm:py-24 md:py-32 lg:py-40" ref={ref}>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* Gold accent line */}
        <motion.div
          className="w-[2px] h-12 bg-[var(--brand-accent)] mx-auto mb-12"
          initial={{ height: 0, opacity: 0 }}
          animate={isInView ? { height: 48, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        />

        <motion.h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--brand-bg)] leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t.positioning_headline}
        </motion.h2>

        <motion.p
          className="mt-8 sm:mt-10 text-lg sm:text-xl text-[var(--brand-bg)]/70 leading-relaxed max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t.positioning_body}
        </motion.p>
      </div>
    </section>
  );
}
