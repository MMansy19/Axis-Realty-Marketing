'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface WhyAxisSectionProps {
  translations: {
    why_axis_headline: string;
    why_axis_pillar_1_title: string;
    why_axis_pillar_1_desc: string;
    why_axis_pillar_2_title: string;
    why_axis_pillar_2_desc: string;
    why_axis_pillar_3_title: string;
    why_axis_pillar_3_desc: string;
  };
}

export default function WhyAxisSection({ translations: t }: WhyAxisSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const pillars = [
    { title: t.why_axis_pillar_1_title, desc: t.why_axis_pillar_1_desc },
    { title: t.why_axis_pillar_2_title, desc: t.why_axis_pillar_2_desc },
    { title: t.why_axis_pillar_3_title, desc: t.why_axis_pillar_3_desc },
  ];

  return (
    <section className="bg-[var(--brand-bg)] py-24 sm:py-32 lg:py-40" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-20 sm:mb-24">
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
            {t.why_axis_headline}
          </motion.h2>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              className="text-center md:text-start"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
            >
              {/* Gold accent line */}
              <div className="w-12 h-[2px] bg-[var(--brand-accent)] mb-8 mx-auto md:mx-0" />
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--brand-text)] mb-5">
                {pillar.title}
              </h3>
              <p className="text-[var(--brand-muted)] leading-relaxed text-sm sm:text-base">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
