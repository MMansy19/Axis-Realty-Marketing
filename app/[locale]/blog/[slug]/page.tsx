import {setRequestLocale, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import Image from 'next/image';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import {Link} from '@/i18n/routing';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import type {Blog} from '@/lib/types/blog';
import type {Metadata} from 'next';

interface PageProps {
  params: Promise<{locale: string; slug: string}>;
}

const BASE_URL = 'https://axis-realty-marketing.vercel.app';

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const isAr = locale === 'ar';
  const altLocale = isAr ? 'en' : 'ar';

  if (!isSupabaseConfigured()) return {title: 'Blog'};

  try {
    const {data: blog} = await supabase
      .from('blogs')
      .select('*, blog_images(*)')
      .eq('slug', slug)
      .single();

    if (!blog) return {title: 'Blog Not Found'};

    const title = isAr ? blog.title_ar : blog.title_en;
    const description = isAr
      ? (blog.title_ar || 'مقال من أكسيس ريلتي ماركتنج')
      : (blog.title_en || 'Article from AXIS REALTY MARKETING');
    const coverImage = blog.blog_images?.[0]?.url;
    const ogImages = coverImage
      ? [{url: coverImage, width: 1200, height: 630, alt: title}]
      : [{url: '/opengraph-image', width: 1200, height: 630, alt: 'AXIS REALTY MARKETING'}];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        siteName: 'AXIS REALTY MARKETING',
        locale: isAr ? 'ar_EG' : 'en_US',
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        images: ogImages,
        ...(blog.created_at && {publishedTime: blog.created_at}),
        ...(blog.updated_at && {modifiedTime: blog.updated_at}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: coverImage ? [coverImage] : ['/opengraph-image'],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/blog/${slug}`,
        languages: {
          [locale]: `${BASE_URL}/${locale}/blog/${slug}`,
          [altLocale]: `${BASE_URL}/${altLocale}/blog/${slug}`,
        },
      },
    };
  } catch {
    return {title: 'Blog'};
  }
}

export default async function BlogDetailPage({params}: PageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Index'});

  if (!isSupabaseConfigured()) {
    notFound();
  }

  let blog;
  try {
    const result = await supabase
      .from('blogs')
      .select('*, blog_images(*)')
      .eq('slug', slug)
      .single();
    blog = result.data;
  } catch {
    notFound();
  }

  if (!blog) {
    notFound();
  }

  const typedBlog: Blog = {
    ...blog,
    blog_images: (blog.blog_images || []).sort(
      (a: {display_order: number}, b: {display_order: number}) => a.display_order - b.display_order
    ),
  };

  const title = locale === 'ar' ? typedBlog.title_ar : typedBlog.title_en;

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)]">
      <div className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors mb-6 sm:mb-8 text-sm py-2">
          {locale === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          {t('blog_back')}
        </Link>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--brand-text)] mb-6 sm:mb-10">
          {title}
        </h1>

        {/* Image Gallery */}
        {typedBlog.blog_images && typedBlog.blog_images.length > 0 && (
          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            {/* Hero image */}
            <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden">
              <Image
                src={typedBlog.blog_images[0].url}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Additional images */}
            {typedBlog.blog_images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {typedBlog.blog_images.slice(1).map((img) => (
                  <div key={img.id} className="relative aspect-[4/3] rounded-sm overflow-hidden">
                    <Image
                      src={img.url}
                      alt={title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video */}
        {typedBlog.video_url && (
          <div className="mb-12">
            <video
              src={typedBlog.video_url}
              controls
              className="w-full rounded-sm bg-black"
              preload="metadata"
            />
          </div>
        )}

        {/* Date */}
        <p className="text-[var(--brand-muted)] text-sm">
          {new Date(typedBlog.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* JSON-LD BlogPosting structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: title,
            image: typedBlog.blog_images?.[0]?.url || `${BASE_URL}/opengraph-image`,
            datePublished: typedBlog.created_at,
            ...(typedBlog.updated_at && {dateModified: typedBlog.updated_at}),
            author: {
              '@type': 'Organization',
              name: 'AXIS REALTY MARKETING',
              url: BASE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: 'AXIS REALTY MARKETING',
              url: BASE_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/icon`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${BASE_URL}/${locale}/blog/${slug}`,
            },
          }),
        }}
      />
    </main>
  );
}
