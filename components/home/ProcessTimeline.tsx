'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface ProcessTimelineProps {
  locale?: string;
  translations: {
    process_headline: string;
    process_step_1: string;
    process_step_1_desc: string;
    process_step_2: string;
    process_step_2_desc: string;
    process_step_3: string;
    process_step_3_desc: string;
    process_step_4: string;
    process_step_4_desc: string;
    process_step_5: string;
    process_step_5_desc: string;
  };
}

export default function ProcessTimeline({ locale, translations: t }: ProcessTimelineProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isRTL = locale === 'ar';

  const steps = [
    { title: t.process_step_1, desc: t.process_step_1_desc },
    { title: t.process_step_2, desc: t.process_step_2_desc },
    { title: t.process_step_3, desc: t.process_step_3_desc },
    { title: t.process_step_4, desc: t.process_step_4_desc },
    { title: t.process_step_5, desc: t.process_step_5_desc },
  ];

  return (
    <section className="bg-[var(--brand-rich-gray)] py-24 sm:py-32 overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
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
            {t.process_headline}
          </motion.h2>
        </div>

        {/* Timeline - Desktop horizontal */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <motion.div
            className="absolute top-6 left-0 h-[2px] bg-[var(--brand-accent)]/30"
            initial={{ width: 0 }}
            animate={isInView ? { width: '100%' } : {}}
            transition={{ duration: 1.2, delay: 0.4 }}
          />

          <div className="grid grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative pt-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
              >
                {/* Circle indicator */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[var(--brand-bg)] border-2 border-[var(--brand-accent)] flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.15, type: 'spring' }}
                >
                  <span className="text-[var(--brand-accent)] font-serif font-bold text-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </motion.div>

                <h3 className="font-serif text-lg font-semibold text-[var(--brand-text)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--brand-muted)] text-xs leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline - Mobile vertical */}
        <div className="lg:hidden space-y-6 sm:space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex gap-5 items-start"
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-bg)] border-2 border-[var(--brand-accent)] flex items-center justify-center">
                  <span className="text-[var(--brand-accent)] font-serif font-bold text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-[2px] h-8 bg-[var(--brand-accent)]/30 mt-2" />
                )}
              </div>
              <div className="pt-1.5">
                <h3 className="font-serif text-lg font-semibold text-[var(--brand-text)] mb-1">
                  {step.title}
                </h3>
                <p className="text-[var(--brand-muted)] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
