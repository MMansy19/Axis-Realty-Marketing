'use client';

import { motion, useInView, animate } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { caseStudies } from '@/data/case-studies';

interface CaseStudySectionProps {
  locale: string;
  translations: {
    case_studies_headline: string;
    case_study_before: string;
    case_study_after: string;
  };
}

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span className="font-serif text-2xl sm:text-3xl  font-bold text-[var(--brand-accent)]">
      {display}{suffix}
    </span>
  );
}

export default function CaseStudySection({ locale, translations: t }: CaseStudySectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isAr = locale === 'ar';
  const [activeIndex, setActiveIndex] = useState(0);

  const study = caseStudies[activeIndex];

  return (
    <section className="bg-[var(--brand-bg)] py-24 sm:py-32" id="case-studies" ref={ref}>
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
            {t.case_studies_headline}
          </motion.h2>
        </div>

        {/* Tabs */}
        {caseStudies.length > 1 && (
          <div className="flex justify-center gap-2 sm:gap-4 mb-12 flex-wrap px-2">
            {caseStudies.map((cs, i) => (
              <button
                key={cs.id}
                onClick={() => setActiveIndex(i)}
                className={`px-4 py-3 text-xs sm:text-sm tracking-wider uppercase font-medium transition-all duration-300 border-b-2 ${
                  i === activeIndex
                    ? 'text-[var(--brand-accent)] border-[var(--brand-accent)]'
                    : 'text-[var(--brand-muted)] border-transparent hover:text-[var(--brand-text)]'
                }`}
              >
                {isAr ? cs.project_name_ar : cs.project_name_en}
              </button>
            ))}
          </div>
        )}

        {/* Case Study Content */}
        <motion.div
          key={study.id}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Before */}
          <div className="bg-[var(--brand-surface)] p-8 sm:p-10">
            <h3 className="font-serif text-xl font-semibold text-[var(--brand-text)] mb-6 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[var(--brand-muted)]" />
              {t.case_study_before}
            </h3>
            <ul className="space-y-4">
              {(isAr ? study.before_ar : study.before_en).map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--brand-muted)] text-sm leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-muted)]/50 mt-2 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="bg-[var(--brand-surface)] p-8 sm:p-10">
            <h3 className="font-serif text-xl font-semibold text-[var(--brand-accent)] mb-6 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[var(--brand-accent)]" />
              {t.case_study_after}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {study.after_metrics.map((metric, i) => (
                <div key={i} className="space-y-2">
                  <AnimatedCounter value={metric.value} suffix={isAr ? metric.suffix_ar : metric.suffix_en} inView={isInView} />
                  <p className="text-[var(--brand-muted)] text-sm">
                    {isAr ? metric.label_ar : metric.label_en}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[var(--brand-text)]/60 text-sm border-t border-[var(--brand-light)]/5 pt-6">
              {isAr ? study.timeline_ar : study.timeline_en}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
