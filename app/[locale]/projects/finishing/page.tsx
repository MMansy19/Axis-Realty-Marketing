import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FinishingProject } from '@/lib/types/project';
import type { Metadata } from 'next';

import Header from '@/components/home/Header';
import Footer from '@/components/Footer';
import ProjectGallery from '@/components/finishing/ProjectGallery';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const BASE_URL = 'https://www.axisrealty.org';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  const title = t('finishing_page_title');
  const description = t('finishing_page_description');

  return {
    title: `${title} | AXIS REALTY MARKETING`,
    description,
    openGraph: {
      title: `${title} | AXIS REALTY MARKETING`,
      description,
      url: `${BASE_URL}/${locale}/projects/finishing`,
      siteName: 'AXIS REALTY MARKETING',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AXIS REALTY MARKETING`,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/projects/finishing`,
      languages: {
        en: `${BASE_URL}/en/projects/finishing`,
        ar: `${BASE_URL}/ar/projects/finishing`,
      },
    },
  };
}

export default async function FinishingProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Index' });

  // Fetch published finishing projects
  let projects: FinishingProject[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('finishing_projects')
        .select('*, finishing_media(*)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      projects = (data || []).map((project) => ({
        ...(project as FinishingProject),
        finishing_media: ((project as FinishingProject).finishing_media || []).sort(
          (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
        ),
      }));
    } catch (e) {
      console.error('Failed to fetch finishing projects:', e);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)]">
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: t('finishing_page_title'),
            description: t('finishing_page_description'),
            url: `${BASE_URL}/${locale}/projects/finishing`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'AXIS REALTY MARKETING',
              url: BASE_URL,
            },
          }),
        }}
      />

      <Header
        locale={locale}
        translations={{
          nav_services: t('nav_services'),
          nav_projects: t('nav_projects'),
          nav_finishing: t('nav_finishing'),
          nav_about: t('nav_about'),
          nav_contact: t('nav_contact'),
          nav_blog: t('nav_blog'),
          cta_strategy_call: t('cta_strategy_call'),
          aria_toggle_menu: t('aria_toggle_menu'),
        }}
      />

      {/* Page Header */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-4">
            <div className="w-[2px] h-10 bg-[var(--brand-accent)] mx-auto mb-8" />
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--brand-text)] tracking-tight mb-4">
              {t('finishing_page_title')}
            </h1>
            <p className="text-[var(--brand-muted)] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {t('finishing_page_description')}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <ProjectGallery
            locale={locale}
            projects={projects}
            translations={{
              finishing_filter_all: t('finishing_filter_all'),
              finishing_filter_apartment: t('finishing_filter_apartment'),
              finishing_filter_villa: t('finishing_filter_villa'),
              finishing_filter_building: t('finishing_filter_building'),
              finishing_area_sqm: t('finishing_area_sqm'),
              finishing_completed: t('finishing_completed'),
              finishing_before: t('finishing_before'),
              finishing_after: t('finishing_after'),
              finishing_close: t('finishing_close'),
              finishing_previous: t('finishing_previous'),
              finishing_next: t('finishing_next'),
              finishing_no_projects: t('finishing_no_projects'),
            }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-accent)]/10 p-10 sm:p-16">
            <div className="w-[2px] h-8 bg-[var(--brand-accent)] mx-auto mb-6" />
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--brand-text)] mb-4">
              {t('finishing_cta')}
            </h2>
            <p className="text-[var(--brand-muted)] text-sm sm:text-base mb-8 max-w-lg mx-auto">
              {t('finishing_subheadline')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/201037217638"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-[var(--brand-accent)] text-[var(--brand-bg)] font-semibold text-sm tracking-wide hover:bg-[var(--brand-accent)]/90 transition-all duration-300"
              >
                {t('cta_whatsapp')}
              </a>
              <a
                href={`/${locale}#contact`}
                className="inline-block px-8 py-4 border border-[var(--brand-text)]/20 text-[var(--brand-text)] text-sm font-medium tracking-wider uppercase hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-all duration-300"
              >
                {t('cta_schedule')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer
        locale={locale}
        translations={{
          tagline: t('footer_tagline'),
          quick_links: t('footer_quick_links'),
          home: t('footer_home'),
          services: t('footer_services'),
          projects: t('footer_projects'),
          finishing: t('nav_finishing'),
          blog: t('footer_blog'),
          contact: t('footer_contact'),
          contact_us: t('footer_contact_us'),
          rights: t('footer_rights'),
          location_cairo: t('location_cairo'),
          aria_whatsapp: t('aria_whatsapp'),
          aria_linkedin: t('aria_linkedin'),
          aria_instagram: t('aria_instagram'),
          aria_facebook: t('aria_facebook'),
          aria_tiktok: t('aria_tiktok'),
        }}
      />
    </main>
  );
}
