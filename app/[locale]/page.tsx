import {setRequestLocale, getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import BlogCard from '@/components/BlogCard';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import type {Blog} from '@/lib/types/blog';

import Header from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import PositioningSection from '@/components/home/PositioningSection';
import ServicesGrid from '@/components/home/ServicesGrid';
import ProjectsSection from '@/components/home/ProjectsSection';
import CaseStudySection from '@/components/home/CaseStudySection';
import FinishingSection from '@/components/home/FinishingSection';
import WhyAxisSection from '@/components/home/WhyAxisSection';
import ProcessTimeline from '@/components/home/ProcessTimeline';
import PrimaryCTASection from '@/components/home/PrimaryCTASection';
import ContactSection from '@/components/home/ContactSection';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/home/StickyCTA';
// import WhatsAppButton from '@/components/home/WhatsAppButton';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Index'});

  // Fetch published blogs for the blog section
  let publishedBlogs: Blog[] = [];
  let finishingMedia: { url: string; thumbnail_url?: string; type: 'image' | 'video' }[] = [];
  if (isSupabaseConfigured()) {
    try {
      const {data: blogs} = await supabase
        .from('blogs')
        .select('*, blog_images(*)')
        .order('display_order', {ascending: true})
        .order('created_at', {ascending: false})
        .limit(6);

      publishedBlogs = (blogs || []).map((blog) => ({
        ...(blog as Blog),
        blog_images: ((blog as Blog).blog_images || []).sort(
          (a: {display_order: number}, b: {display_order: number}) => a.display_order - b.display_order
        ),
      }));
    } catch (e) {
      console.error('Failed to fetch blogs:', e);
    }

    // Fetch featured finishing media (latest published projects' media)
    try {
      const {data: media} = await supabase
        .from('finishing_media')
        .select('url, thumbnail_url, type, project_id, display_order')
        .order('display_order', {ascending: true})
        .limit(8);

      finishingMedia = (media || []).map((m: { url: string; thumbnail_url?: string; type: string }) => ({
        url: m.url,
        thumbnail_url: m.thumbnail_url || undefined,
        type: m.type as 'image' | 'video',
      }));
    } catch (e) {
      console.error('Failed to fetch finishing media:', e);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)]">
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AXIS REALTY MARKETING',
            description: 'Strategic Real Estate Marketing & Sales Management for Ambitious Developers',
            url: 'https://axis-realty-marketing.vercel.app',
            logo: 'https://axis-realty-marketing.vercel.app/logo.png',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+20-10-37163571',
              contactType: 'sales',
              areaServed: 'EG',
              availableLanguage: ['English', 'Arabic'],
            },
            sameAs: [
              'https://linkedin.com/company/axis-realty-marketing',
              'https://www.instagram.com/axisrealtymarketing',
              'https://www.facebook.com/profile.php?id=61575345401095',
              'https://wa.me/201037217638',
            ],
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Cairo',
              addressCountry: 'EG',
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

      <HeroSection
        locale={locale}
        translations={{
          hero_headline_1: t('hero_headline_1'),
          hero_headline_2: t('hero_headline_2'),
          hero_subheadline: t('hero_subheadline'),
          cta_strategy_call: t('cta_strategy_call'),
          cta_view_projects: t('cta_view_projects'),
        }}
      />

      <PositioningSection
        translations={{
          positioning_headline: t('positioning_headline'),
          positioning_body: t('positioning_body'),
        }}
      />

      <ServicesGrid
        translations={{
          services_headline: t('services_headline'),
          service_1_title: t('service_1_title'),
          service_1_desc: t('service_1_desc'),
          service_2_title: t('service_2_title'),
          service_2_desc: t('service_2_desc'),
          service_3_title: t('service_3_title'),
          service_3_desc: t('service_3_desc'),
          service_4_title: t('service_4_title'),
          service_4_desc: t('service_4_desc'),
        }}
      />

      <ProjectsSection
        locale={locale}
        translations={{
          projects_headline: t('projects_headline'),
          project_status_launching: t('project_status_launching'),
          project_status_selling: t('project_status_selling'),
          project_status_sold_out: t('project_status_sold_out'),
          project_status_construction: t('project_status_construction'),
          view_case_study: t('view_case_study'),
        }}
      />

      <CaseStudySection
        locale={locale}
        translations={{
          case_studies_headline: t('case_studies_headline'),
          case_study_before: t('case_study_before'),
          case_study_after: t('case_study_after'),
        }}
      />

      <FinishingSection
        locale={locale}
        translations={{
          finishing_headline: t('finishing_headline'),
          finishing_subheadline: t('finishing_subheadline'),
          finishing_stat_buildings: t('finishing_stat_buildings'),
          finishing_stat_buildings_label: t('finishing_stat_buildings_label'),
          finishing_locations_title: t('finishing_locations_title'),
          finishing_location_dreamland: t('finishing_location_dreamland'),
          finishing_location_zayed: t('finishing_location_zayed'),
          finishing_location_san_capital: t('finishing_location_san_capital'),
          finishing_cta: t('finishing_cta'),
          finishing_view_all: t('finishing_view_all'),
        }}
        featuredMedia={finishingMedia}
      />

      {/* Blog Section */}
      {publishedBlogs.length > 0 && (
        <section className="bg-[var(--brand-rich-gray)] py-24 sm:py-32" id="blog">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center mb-16 sm:mb-20">
              <div className="w-[2px] h-10 bg-[var(--brand-accent)] mx-auto mb-8" />
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] tracking-tight">
                {t('blog_section_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {publishedBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} locale={locale} translations={{ blog_no_image: t('blog_no_image'), blog_has_video: t('blog_has_video') }} />
              ))}
            </div>

            {publishedBlogs.length >= 6 && (
              <div className="text-center mt-12">
                <a
                  href={`/${locale}/blog`}
                  className="inline-block px-8 py-3 border border-[var(--brand-text)]/20 text-[var(--brand-text)] text-sm font-medium tracking-wider uppercase hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-all duration-300"
                >
                  {t('view_all_blogs')}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <WhyAxisSection
        translations={{
          why_axis_headline: t('why_axis_headline'),
          why_axis_pillar_1_title: t('why_axis_pillar_1_title'),
          why_axis_pillar_1_desc: t('why_axis_pillar_1_desc'),
          why_axis_pillar_2_title: t('why_axis_pillar_2_title'),
          why_axis_pillar_2_desc: t('why_axis_pillar_2_desc'),
          why_axis_pillar_3_title: t('why_axis_pillar_3_title'),
          why_axis_pillar_3_desc: t('why_axis_pillar_3_desc'),
        }}
      />

      <ProcessTimeline
        translations={{
          process_headline: t('process_headline'),
          process_step_1: t('process_step_1'),
          process_step_1_desc: t('process_step_1_desc'),
          process_step_2: t('process_step_2'),
          process_step_2_desc: t('process_step_2_desc'),
          process_step_3: t('process_step_3'),
          process_step_3_desc: t('process_step_3_desc'),
          process_step_4: t('process_step_4'),
          process_step_4_desc: t('process_step_4_desc'),
          process_step_5: t('process_step_5'),
          process_step_5_desc: t('process_step_5_desc'),
        }}
      />

      <PrimaryCTASection
        translations={{
          primary_cta_headline: t('primary_cta_headline'),
          primary_cta_subheadline: t('primary_cta_subheadline'),
          cta_schedule: t('cta_schedule'),
        }}
      />

      <ContactSection
        locale={locale}
        translations={{
          contact_headline: t('contact_headline'),
          contact_subheadline: t('contact_subheadline'),
          contact_name: t('contact_name'),
          contact_company: t('contact_company'),
          contact_phone: t('contact_phone'),
          contact_email: t('contact_email'),
          contact_project_type: t('contact_project_type'),
          contact_project_type_residential: t('contact_project_type_residential'),
          contact_project_type_commercial: t('contact_project_type_commercial'),
          contact_project_type_mixed: t('contact_project_type_mixed'),
          contact_project_type_hospitality: t('contact_project_type_hospitality'),
          contact_message: t('contact_message'),
          contact_submit: t('contact_submit'),
          contact_success: t('contact_success'),
          contact_error: t('contact_error'),
          contact_required: t('contact_required'),
          contact_invalid_email: t('contact_invalid_email'),
          location_cairo: t('location_cairo'),
          aria_whatsapp: t('aria_whatsapp'),
          aria_linkedin: t('aria_linkedin'),
          aria_instagram: t('aria_instagram'),
          aria_facebook: t('aria_facebook'),
        }}
      />

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
        }}
      />

      <StickyCTA
        translations={{
          sticky_text: t('sticky_text'),
          call_now: t('call_now'),
          cta_whatsapp: t('cta_whatsapp'),
        }}
      />

      {/* <WhatsAppButton locale={locale} aria_whatsapp={t('aria_whatsapp')} /> */}
    </main>
  );
}
