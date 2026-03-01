'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface ServicesGridProps {
  translations: {
    services_headline: string;
    service_1_title: string;
    service_1_desc: string;
    service_2_title: string;
    service_2_desc: string;
    service_3_title: string;
    service_3_desc: string;
    service_4_title: string;
    service_4_desc: string;
  };
}

/* Minimal gold-line SVG icons */
const ServiceIcons = {
  positioning: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#C79E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <circle cx="24" cy="24" r="10" />
      <path d="M24 4v8M24 36v8M4 24h8M36 24h8" />
      <path d="M24 18v12M18 24h12" />
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#C79E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M6 38L16 24l8 8 12-16" />
      <path d="M30 16h8v8" />
      <rect x="4" y="8" width="40" height="32" rx="2" />
    </svg>
  ),
  leads: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#C79E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M24 4L24 44" />
      <path d="M12 16l12-12 12 12" />
      <circle cx="12" cy="32" r="4" />
      <circle cx="36" cy="32" r="4" />
      <path d="M16 32h16" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#C79E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M12 36l8-8 6 6 10-14" />
      <path d="M8 44h32" />
      <path d="M12 44V20M20 44V28M28 44V22M36 44V14" />
    </svg>
  ),
};

export default function ServicesGrid({ translations: t }: ServicesGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const services = [
    { icon: ServiceIcons.positioning, title: t.service_1_title, desc: t.service_1_desc },
    { icon: ServiceIcons.marketing, title: t.service_2_title, desc: t.service_2_desc },
    { icon: ServiceIcons.leads, title: t.service_3_title, desc: t.service_3_desc },
    { icon: ServiceIcons.sales, title: t.service_4_title, desc: t.service_4_desc },
  ];

  return (
    <section className="bg-[var(--brand-bg)] py-24 sm:py-32" id="services" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section header */}
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
            {t.services_headline}
          </motion.h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {services.map((service, i) => (
            <motion.div
              key={i}
              className="group border-t-2 border-[var(--brand-accent)] bg-[var(--brand-surface)] p-8 sm:p-10 hover:-translate-y-1 transition-transform duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <div className="mb-6">{service.icon}</div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--brand-text)] mb-4">
                {service.title}
              </h3>
              <p className="text-[var(--brand-muted)] leading-relaxed text-sm sm:text-base">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
