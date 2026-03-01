'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import Logo from '@/components/Logo';

interface HeaderProps {
  locale: string;
  translations: {
    nav_services: string;
    nav_projects: string;
    nav_about: string;
    nav_contact: string;
    nav_blog: string;
    cta_strategy_call: string;
    aria_toggle_menu: string;
  };
}

export default function Header({ locale, translations: t }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Build the alternate-locale path preserving the current page
  const altLocale = locale === 'en' ? 'ar' : 'en';
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
  const altHref = `/${altLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

  const navLinks = [
    { href: '#services', label: t.nav_services },
    { href: '#projects', label: t.nav_projects },
    { href: '#about', label: t.nav_about },
    { href: '#contact', label: t.nav_contact },
    { href: `/${locale}/blog`, label: t.nav_blog },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[var(--brand-bg)]/95 backdrop-blur-md border-b border-[var(--brand-accent)]/10 py-0'
          : 'bg-transparent py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href={`/${locale}`} className="flex-shrink-0">
          <Logo variant="horizontal" scheme="light" locale={locale} className="h-16 sm:h-18 lg:h-20 w-auto" />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[var(--brand-text)]/70 hover:text-[var(--brand-accent)] transition-colors text-sm tracking-wider uppercase font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <a
            href={altHref}
            className="px-3 py-2.5 text-sm text-[var(--brand-text)]/70 hover:text-[var(--brand-accent)] transition-colors tracking-wide"
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </a>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-3"
            aria-label={t.aria_toggle_menu}
          >
            <span className={`block w-6 h-0.5 bg-[var(--brand-text)] transition-transform duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[var(--brand-text)] transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[var(--brand-text)] transition-transform duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-[var(--brand-bg)]/98 backdrop-blur-xl border-b border-[var(--brand-accent)]/10 transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-[var(--brand-text)] text-lg tracking-wider uppercase font-medium py-3 border-b border-[var(--brand-light)]/5"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="mt-2 px-5 py-3 bg-[var(--brand-accent)] text-[var(--brand-bg)] text-sm font-semibold tracking-wide text-center"
          >
            {t.cta_strategy_call}
          </a>
        </nav>
      </div>
    </header>
  );
}
