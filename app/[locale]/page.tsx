import {useTranslations} from 'next-intl';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import Image from 'next/image';
import {MapPin, ShieldCheck, Clock, TrendingUp, Phone, MessageSquare, Shield, Crown} from 'lucide-react';
import {routing} from '@/i18n/routing';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import type {Blog} from '@/lib/types/blog';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Index'});

  // Fetch published blogs for the blog section
  let publishedBlogs: Blog[] = [];
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
  }

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 py-4 px-4 sm:py-6 sm:px-6 md:px-12 lg:px-24 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Logo className="w-16 h-14 md:w-22 md:h-16" />
          <div className="flex flex-col">
            <span className={`font-serif text-xl sm:text-2xl md:text-3xl tracking-widest text-[var(--brand-text)] leading-none uppercase ${locale === 'ar' ? 'font-arabic' : ''}`}>
              {locale === 'en' ? 'Imperium' : 'إمبيريوم'}
            </span>
            <span className={`text-[0.55rem] sm:text-[0.65rem] md:text-xs tracking-[0.25em] sm:tracking-[0.3em] text-[var(--brand-accent)] uppercase mt-0.5 sm:mt-1 ${locale === 'ar' ? 'font-sans' : 'font-arabic'}`}>
              {locale === 'en' ? 'Developments' : 'للتطوير'}
            </span>
          </div>
        </div>
        
        {/* Language Switcher */}
        <div className="hidden sm:block">
          <a 
            href={locale === 'en' ? '/ar' : '/en'} 
            className="px-4 py-2 bg-[var(--brand-bg)]/30 backdrop-blur-md border border-[var(--brand-light)]/20 text-[var(--brand-text)] text-sm font-medium rounded-sm hover:bg-[var(--brand-light)]/10 transition-colors"
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </a>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Mobile Language Switcher */}
        <div className="absolute top-6 end-6 z-50 sm:hidden">
          <a 
            href={locale === 'en' ? '/ar' : '/en'} 
            className="px-4 py-2 bg-[var(--brand-bg)]/30 backdrop-blur-md border border-[var(--brand-light)]/20 text-[var(--brand-text)] text-sm font-medium rounded-sm hover:bg-[var(--brand-light)]/10 transition-colors"
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </a>
        </div>

        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/1920/1080?random=1"
            alt="Luxury Real Estate"
            fill
            className="object-cover scale-105 animate-slow-zoom"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[var(--brand-bg)] z-10" />
        </div>
        
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 tracking-tight text-[var(--brand-text)] drop-shadow-lg">
            {t('hero_headline')}
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-[var(--brand-light)] mb-8 sm:mb-10 max-w-3xl mx-auto font-light leading-relaxed opacity-90">
            {t('hero_subheadline')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a href="#projects" className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-2)] text-[var(--brand-bg)] font-medium rounded-sm transition-all duration-300 w-full sm:w-auto text-center tracking-wide text-sm sm:text-base">
              {t('explore_projects')}
            </a>
            <a href="#inquiry" className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border border-[var(--brand-light)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-bg)] text-[var(--brand-text)] font-medium rounded-sm transition-all duration-300 w-full sm:w-auto text-center tracking-wide text-sm sm:text-base">
              {t('book_visit')}
            </a>
          </div>
        </div>
      </section>

      {/* 2. About Us Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)]">
              {t('about_title')}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)]"></div>
            <p className="text-[var(--brand-muted)] text-lg leading-relaxed">
              {t('about_vision')}
            </p>
            <p className="text-[var(--brand-muted)] text-lg leading-relaxed">
              {t('about_mission')}
            </p>
          </div>
          <div className="relative h-[300px] sm:h-[500px] w-full rounded-sm overflow-hidden shadow-2xl">
            <Image
              src="https://picsum.photos/800/1000?random=2"
              alt="Corporate Real Estate"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 3. Our Past Works (Projects Section) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-24 bg-[var(--brand-rich-gray)]" id="projects">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] mb-4 sm:mb-6">
              {t('projects_title')}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Project 1 */}
            <div className="group bg-[var(--brand-bg)] rounded-sm overflow-hidden border border-[var(--brand-light)]/5 hover:border-[var(--brand-accent)]/30 transition-all duration-500 hover:-translate-y-2 shadow-lg">
              <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                <Image
                  src="https://picsum.photos/600/400?random=3"
                  alt={t('project_1_title')}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--brand-text)] mb-3">{t('project_1_title')}</h3>
                <p className="text-[var(--brand-muted)] mb-6 text-sm leading-relaxed">{t('project_1_desc')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--brand-accent)] font-medium">{t('project_1_price')}</span>
                  <a href="#inquiry" className="text-[var(--brand-text)] hover:text-[var(--brand-accent)] transition-colors text-sm uppercase tracking-wider font-medium">
                    {t('view_details')}
                  </a>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="group bg-[var(--brand-bg)] rounded-sm overflow-hidden border border-[var(--brand-light)]/5 hover:border-[var(--brand-accent)]/30 transition-all duration-500 hover:-translate-y-2 shadow-lg">
              <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                <Image
                  src="https://picsum.photos/600/400?random=4"
                  alt={t('project_2_title')}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--brand-text)] mb-3">{t('project_2_title')}</h3>
                <p className="text-[var(--brand-muted)] mb-6 text-sm leading-relaxed">{t('project_2_desc')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--brand-accent)] font-medium">{t('project_2_price')}</span>
                  <a href="#inquiry" className="text-[var(--brand-text)] hover:text-[var(--brand-accent)] transition-colors text-sm uppercase tracking-wider font-medium">
                    {t('view_details')}
                  </a>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="group bg-[var(--brand-bg)] rounded-sm overflow-hidden border border-[var(--brand-light)]/5 hover:border-[var(--brand-accent)]/30 transition-all duration-500 hover:-translate-y-2 shadow-lg">
              <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                <Image
                  src="https://picsum.photos/600/400?random=5"
                  alt={t('project_3_title')}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--brand-text)] mb-3">{t('project_3_title')}</h3>
                <p className="text-[var(--brand-muted)] mb-6 text-sm leading-relaxed">{t('project_3_desc')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--brand-accent)] font-medium">{t('project_3_price')}</span>
                  <a href="#inquiry" className="text-[var(--brand-text)] hover:text-[var(--brand-accent)] transition-colors text-sm uppercase tracking-wider font-medium">
                    {t('view_details')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Blog Section */}
      {publishedBlogs.length > 0 && (
        <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto" id="blog">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] mb-4 sm:mb-6">
              {t('blog_section_title')}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {publishedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} locale={locale} />
            ))}
          </div>

          {publishedBlogs.length >= 6 && (
            <div className="text-center mt-12">
              <a
                href={`/${locale}/blog`}
                className="px-8 py-3 bg-transparent border border-[var(--brand-light)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-bg)] text-[var(--brand-text)] font-medium rounded-sm transition-all duration-300 text-sm uppercase tracking-wider"
              >
                {t('view_all_blogs')}
              </a>
            </div>
          )}
        </section>
      )}

      {/* 4. Why Choose Us Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] mb-4 sm:mb-6">
            {t('why_choose_us')}
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 flex items-center justify-center text-[var(--brand-accent)] mb-2">
              <MapPin size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--brand-text)]">{t('feature_1_title')}</h3>
            <p className="text-[var(--brand-muted)] text-sm leading-relaxed">{t('feature_1_desc')}</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 flex items-center justify-center text-[var(--brand-accent)] mb-2">
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--brand-text)]">{t('feature_2_title')}</h3>
            <p className="text-[var(--brand-muted)] text-sm leading-relaxed">{t('feature_2_desc')}</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 flex items-center justify-center text-[var(--brand-accent)] mb-2">
              <Clock size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--brand-text)]">{t('feature_3_title')}</h3>
            <p className="text-[var(--brand-muted)] text-sm leading-relaxed">{t('feature_3_desc')}</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 flex items-center justify-center text-[var(--brand-accent)] mb-2">
              <TrendingUp size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--brand-text)]">{t('feature_4_title')}</h3>
            <p className="text-[var(--brand-muted)] text-sm leading-relaxed">{t('feature_4_desc')}</p>
          </div>
        </div>
      </section>

      {/* 5. Property Inquiry Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-24 bg-[var(--brand-rich-gray)]" id="inquiry">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] mb-4 sm:mb-6">
              {t('inquiry_title')}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)] mx-auto"></div>
          </div>

          <form className="space-y-5 sm:space-y-6 bg-[var(--brand-bg)] p-6 sm:p-8 md:p-12 rounded-sm border border-[var(--brand-light)]/5 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--brand-muted)] uppercase tracking-wider">{t('inquiry_name')}</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 rounded-sm px-4 py-3 text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--brand-muted)] uppercase tracking-wider">{t('inquiry_phone')}</label>
                <input 
                  type="tel" 
                  className="w-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 rounded-sm px-4 py-3 text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--brand-muted)] uppercase tracking-wider">{t('inquiry_project')}</label>
              <select className="w-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 rounded-sm px-4 py-3 text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors appearance-none">
                <option value="">-- Select a Project --</option>
                <option value="new-cairo">{t('project_1_title')}</option>
                <option value="seaside">{t('project_2_title')}</option>
                <option value="urban">{t('project_3_title')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--brand-muted)] uppercase tracking-wider">{t('inquiry_message')}</label>
              <textarea 
                rows={4}
                className="w-full bg-[var(--brand-olive)] border border-[var(--brand-light)]/10 rounded-sm px-4 py-3 text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors resize-none"
              ></textarea>
            </div>
            <button 
              type="button" 
              className="w-full bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-2)] text-[var(--brand-bg)] font-medium py-4 rounded-sm transition-colors tracking-wide uppercase text-sm"
            >
              {t('send_inquiry')}
            </button>
            <p className="text-center text-[var(--brand-muted)] text-sm mt-6">
              {t('or_call')}
            </p>
          </form>
        </div>
      </section>

      {/* 6. Google Maps Section */}
      <section className="h-[250px] sm:h-[400px] w-full bg-[var(--brand-olive)]">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.664426543161!2d31.3204983!3d30.0464296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e5c3c137409%3A0x6b4fb712d921e149!2sCairo%2C%20Cairo%20Governorate%2C%20Egypt!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        ></iframe>
      </section>

      {/* 7. Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--brand-bg)]/90 backdrop-blur-md border-t border-[var(--brand-light)]/10 py-3 sm:py-4 px-4 sm:px-6 z-40 transform translate-y-0 transition-transform duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[var(--brand-text)] font-medium text-xs sm:text-sm md:text-base text-center sm:text-start">
            {t('sticky_text')}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <a href="#inquiry" className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-transparent border border-[var(--brand-light)] text-[var(--brand-text)] text-xs sm:text-sm font-medium rounded-sm hover:bg-[var(--brand-light)] hover:text-[var(--brand-bg)] transition-colors text-center">
              {t('inquiry')}
            </a>
            <a href="tel:+201234567890" className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[var(--brand-accent)] text-[var(--brand-bg)] text-xs sm:text-sm font-medium rounded-sm hover:bg-[var(--brand-accent-2)] transition-colors text-center flex items-center justify-center gap-2">
              <Phone size={14} className="sm:hidden" />
              <Phone size={16} className="hidden sm:block" />
              {t('call_now')}
            </a>
          </div>
        </div>
      </div>

      {/* 8. WhatsApp Floating Button */}
      <a 
        href="https://wa.me/201234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 end-4 sm:bottom-24 sm:end-8 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 z-50"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare size={24} className="sm:hidden" />
        <MessageSquare size={28} className="hidden sm:block" />
      </a>

      {/* Footer */}
      <Footer 
        locale={locale} 
        translations={{
          company_name: locale === 'ar' ? 'إمبيريوم للتطوير' : 'Imperium Developments',
          tagline: t('hero_subheadline'),
          quick_links: locale === 'ar' ? 'روابط سريعة' : 'Quick Links',
          home: locale === 'ar' ? 'الرئيسية' : 'Home',
          projects: locale === 'ar' ? 'المشاريع' : 'Projects',
          about: locale === 'ar' ? 'عن الشركة' : 'About',
          blog: locale === 'ar' ? 'المدونة' : 'Blog',
          contact_us: locale === 'ar' ? 'تواصل معنا' : 'Contact Us',
          inquiry: locale === 'ar' ? 'استفسار عن عقار' : 'Property Inquiry',
          rights_reserved: locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.',
        }}
      />

    </main>
  );
}
