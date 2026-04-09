import {setRequestLocale, getTranslations} from 'next-intl/server';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import BlogCard from '@/components/BlogCard';
import type {Blog} from '@/lib/types/blog';
import {Link} from '@/i18n/routing';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import type {Metadata} from 'next';

const BASE_URL = 'https://www.axisrealty.org';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const isAr = locale === 'ar';
  const altLocale = isAr ? 'en' : 'ar';

  const title = isAr ? 'المدونة' : 'Blog';
  const description = isAr
    ? 'اقرأ أحدث المقالات والرؤى حول التسويق العقاري وإدارة المبيعات من أكسيس ريلتي ماركتنج.'
    : 'Read the latest articles and insights on real estate marketing and sales management from AXIS REALTY MARKETING.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'AXIS REALTY MARKETING',
      locale: isAr ? 'ar_EG' : 'en_US',
      url: `${BASE_URL}/${locale}/blog`,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'AXIS REALTY MARKETING Blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        [locale]: `${BASE_URL}/${locale}/blog`,
        [altLocale]: `${BASE_URL}/${altLocale}/blog`,
      },
    },
  };
}

export default async function BlogListPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Index'});

  let publishedBlogs: Blog[] = [];
  if (isSupabaseConfigured()) {
    try {
      const {data: blogs} = await supabase
        .from('blogs')
        .select('*, blog_images(*)')
        .order('display_order', {ascending: true})
        .order('created_at', {ascending: false});

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
      <div className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors mb-8 sm:mb-12 text-sm py-2">
          {locale === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {t('blog_home')}
        </Link>

        <div className="text-center mb-10 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] mb-4 sm:mb-6">
            {t('blog_section_title')}
          </h1>
          <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)] mx-auto"></div>
        </div>

        {publishedBlogs.length === 0 ? (
          <p className="text-center text-[var(--brand-muted)]">
            {t('blog_no_posts')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {publishedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} locale={locale} translations={{ blog_no_image: t('blog_no_image'), blog_has_video: t('blog_has_video') }} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
