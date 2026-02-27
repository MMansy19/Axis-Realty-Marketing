import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  locale?: string;
  translations?: {
    company_name: string;
    tagline: string;
    quick_links: string;
    home: string;
    projects: string;
    about: string;
    blog: string;
    contact_us: string;
    inquiry: string;
    rights_reserved: string;
  };
}

const defaultTranslations = {
  company_name: 'Imperium Developments',
  tagline: 'Premium Living, Thoughtfully Crafted',
  quick_links: 'Quick Links',
  home: 'Home',
  projects: 'Projects',
  about: 'About',
  blog: 'Blog',
  contact_us: 'Contact Us',
  inquiry: 'Property Inquiry',
  rights_reserved: 'All rights reserved.',
};

export default function Footer({ locale = 'en', translations }: FooterProps) {
  const t = translations || defaultTranslations;
  const isAr = locale === 'ar';

  return (
    <footer className="bg-[var(--brand-rich-gray)] border-t border-[var(--brand-light)]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Imperium Developments"
                width={52}
                height={52}
                className="flex-shrink-0 w-12 h-12 sm:w-13 sm:h-13"
                quality={100}
              />
              <div className="flex flex-col">
                <span className={`font-serif text-xl sm:text-2xl tracking-widest text-[var(--brand-text)] leading-none uppercase ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? 'إمبيريوم' : 'Imperium'}
                </span>
                <span className={`text-[0.6rem] tracking-[0.25em] text-[var(--brand-accent)] uppercase mt-0.5 ${isAr ? 'font-sans' : ''}`}>
                  {isAr ? 'للتطوير' : 'Developments'}
                </span>
              </div>
            </div>
            <p className="text-[var(--brand-muted)] text-sm leading-relaxed max-w-xs">
              {t.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-[var(--brand-text)] font-semibold text-sm uppercase tracking-wider">
              {t.quick_links}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href={`/${locale}`} className="text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  {t.home}
                </a>
              </li>
              <li>
                <a href={`/${locale}#projects`} className="text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  {t.projects}
                </a>
              </li>
              <li>
                <a href={`/${locale}#about`} className="text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  {t.about}
                </a>
              </li>
              <li>
                <a href={`/${locale}/blog`} className="text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  {t.blog}
                </a>
              </li>
              <li>
                <a href={`/${locale}#inquiry`} className="text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  {t.inquiry}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-[var(--brand-text)] font-semibold text-sm uppercase tracking-wider">
              {t.contact_us}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+201234567890" className="flex items-center gap-3 text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>+20 123 456 7890</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@imperiumdev.com" className="flex items-center gap-3 text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors text-sm">
                  <Mail size={16} className="flex-shrink-0" />
                  <span>info@imperiumdev.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-[var(--brand-muted)] text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{isAr ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--brand-light)]/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[var(--brand-muted)] text-xs sm:text-sm text-center sm:text-start">
              &copy; {new Date().getFullYear()} {t.company_name}. {t.rights_reserved}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/201234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--brand-muted)] hover:text-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
