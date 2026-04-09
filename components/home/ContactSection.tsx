'use client';

import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Phone, Mail, MapPin, Globe, Send, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';

interface ContactSectionProps {
  locale: string;
  translations: {
    contact_headline: string;
    contact_subheadline: string;
    contact_name: string;
    contact_company: string;
    contact_phone: string;
    contact_email: string;
    contact_project_type: string;
    contact_project_type_residential: string;
    contact_project_type_commercial: string;
    contact_project_type_mixed: string;
    contact_project_type_hospitality: string;
    contact_message: string;
    contact_submit: string;
    contact_success: string;
    contact_error: string;
    contact_required: string;
    contact_invalid_email: string;
    location_cairo: string;
    aria_whatsapp: string;
    aria_linkedin: string;
    aria_instagram: string;
    aria_facebook: string;
    aria_tiktok: string;
  };
}

export default function ContactSection({ locale, translations: t }: ContactSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    email: '',
    project_type: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = t.contact_required;
    if (!formData.phone.trim()) newErrors.phone = t.contact_required;
    if (!formData.email.trim()) {
      newErrors.email = t.contact_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.contact_invalid_email;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ full_name: '', company_name: '', phone: '', email: '', project_type: '', message: '' });
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const inputClass = (field: string) =>
    `w-full bg-[var(--brand-surface)] border ${
      errors[field] ? 'border-red-500' : 'border-[var(--brand-light)]/10 focus:border-[var(--brand-accent)]'
    } text-[var(--brand-text)] text-sm px-4 py-3 outline-none transition-colors placeholder:text-[var(--brand-muted)]/50`;

  const projectTypes = [
    { value: 'residential', label: t.contact_project_type_residential },
    { value: 'commercial', label: t.contact_project_type_commercial },
    { value: 'mixed', label: t.contact_project_type_mixed },
    { value: 'hospitality', label: t.contact_project_type_hospitality },
  ];

  const mapsUrl = isRTL
    ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.2!2d31.1128!3d29.9875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14584f0a4c9c5e1d%3A0x4e2e0e6c1a8b2d3f!2sHadayek%20El-Ahram%2C%20Giza%2C%20Egypt!5e0!3m2!1sar!2seg!4v1700000000000!5m2!1sar!2seg'
    : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.2!2d31.1128!3d29.9875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14584f0a4c9c5e1d%3A0x4e2e0e6c1a8b2d3f!2sHadayek%20El-Ahram%2C%20Giza%2C%20Egypt!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg';

  return (
    <section className="bg-[var(--brand-rich-gray)] py-24 sm:py-32" id="contact" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
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
            {t.contact_headline}
          </motion.h2>
          <motion.p
            className="mt-4 text-[var(--brand-muted)] text-lg"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {t.contact_subheadline}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <input
                  type="text"
                  placeholder={t.contact_name}
                  value={formData.full_name}
                  onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                  className={inputClass('full_name')}
                />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
              </div>
              {/* Company */}
              <div>
                <input
                  type="text"
                  placeholder={t.contact_company}
                  value={formData.company_name}
                  onChange={(e) => setFormData((p) => ({ ...p, company_name: e.target.value }))}
                  className={inputClass('company_name')}
                />
              </div>
              {/* Phone */}
              <div>
                <input
                  type="tel"
                  placeholder={t.contact_phone}
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder={t.contact_email}
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className={inputClass('email')}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Project Type */}
            <select
              value={formData.project_type}
              onChange={(e) => setFormData((p) => ({ ...p, project_type: e.target.value }))}
              className={`${inputClass('project_type')} ${!formData.project_type ? 'text-[var(--brand-muted)]/50' : ''}`}
            >
              <option value="">{t.contact_project_type}</option>
              {projectTypes.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>

            {/* Message */}
            <textarea
              placeholder={t.contact_message}
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              className={`${inputClass('message')} resize-none`}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[var(--brand-accent)] text-[var(--brand-bg)] font-semibold tracking-wider text-sm uppercase hover:bg-[var(--brand-accent)]/90 transition-colors disabled:opacity-60"
            >
              <Send size={16} />
              {status === 'submitting' ? '...' : t.contact_submit}
            </button>

            {/* Status Messages */}
            {status === 'success' && (
              <p className="flex items-center gap-2 text-emerald-400 text-sm mt-3">
                <CheckCircle size={16} /> {t.contact_success}
              </p>
            )}
            {status === 'error' && (
              <p className="flex items-center gap-2 text-red-400 text-sm mt-3">
                <AlertCircle size={16} /> {t.contact_error}
              </p>
            )}
          </motion.form>

          {/* Sidebar — Contact Info */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <a href="tel:+201037163571" className="flex items-center gap-4 text-[var(--brand-text)] hover:text-[var(--brand-accent)] transition-colors group">
              <div className="w-10 h-10 bg-[var(--brand-surface)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--brand-accent)]/10 transition-colors">
                <Phone size={18} className="text-[var(--brand-accent)]" />
              </div>
              <span className="text-sm">+20 10 37163571</span>
            </a>
            <a href="https://api.whatsapp.com/send/?phone=201037217638" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-[var(--brand-text)] hover:text-[#25D366] transition-colors group">
              <div className="w-10 h-10 bg-[var(--brand-surface)] flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/10 transition-colors">
                <MessageCircle size={18} className="text-[#25D366]" />
              </div>
              <span className="text-sm">+20 10 37217638</span>
            </a>
            <a href="mailto:axisrealtymarket@gmail.com" className="flex items-center gap-4 text-[var(--brand-text)] hover:text-[var(--brand-accent)] transition-colors group min-w-0">
              <div className="w-10 h-10 bg-[var(--brand-surface)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--brand-accent)]/10 transition-colors">
                <Mail size={18} className="text-[var(--brand-accent)]" />
              </div>
              <span className="text-sm truncate">axisrealtymarket@gmail.com</span>
            </a>
            <div className="flex items-center gap-4 text-[var(--brand-text)]">
              <div className="w-10 h-10 bg-[var(--brand-surface)] flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-[var(--brand-accent)]" />
              </div>
              <span className="text-sm">{t.location_cairo}</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://wa.me/201037217638"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[var(--brand-surface)] flex items-center justify-center text-[var(--brand-muted)] hover:text-[#25D366] transition-colors"
                aria-label={t.aria_whatsapp}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/axis-realty-marketing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[var(--brand-surface)] flex items-center justify-center text-[var(--brand-muted)] hover:text-[#0A66C2] transition-colors"
                aria-label={t.aria_linkedin}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/axisrealtymarketing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[var(--brand-surface)] flex items-center justify-center text-[var(--brand-muted)] hover:text-[#E4405F] transition-colors"
                aria-label={t.aria_instagram}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575345401095"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[var(--brand-surface)] flex items-center justify-center text-[var(--brand-muted)] hover:text-[#1877F2] transition-colors"
                aria-label={t.aria_facebook}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@axis.realty.marke"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[var(--brand-surface)] flex items-center justify-center text-[var(--brand-muted)] hover:text-[#fe2c55] transition-colors"
                aria-label={t.aria_tiktok}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.2 8.2 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z"/>
                </svg>
              </a>
            </div>

            {/* Map */}
            <div className="w-full h-[250px] overflow-hidden mt-4">
              <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
