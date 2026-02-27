import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import Image from 'next/image';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import {Link} from '@/i18n/routing';
import {ArrowLeft} from 'lucide-react';
import type {Blog} from '@/lib/types/blog';
import type {Metadata} from 'next';

interface PageProps {
  params: Promise<{locale: string; slug: string}>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale, slug} = await params;

  if (!isSupabaseConfigured()) return {title: 'Blog'};

  try {
    const {data: blog} = await supabase
      .from('blogs')
      .select('*, blog_images(*)')
      .eq('slug', slug)
      .single();

    if (!blog) return {title: 'Blog Not Found'};

    const title = locale === 'ar' ? blog.title_ar : blog.title_en;
    const coverImage = blog.blog_images?.[0]?.url;

    return {
      title: `${title} | Imperium Developments`,
      openGraph: {
        title,
        images: coverImage ? [coverImage] : [],
      },
    };
  } catch {
    return {title: 'Blog'};
  }
}

export default async function BlogDetailPage({params}: PageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

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
      <div className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors mb-6 sm:mb-8 text-sm">
          <ArrowLeft size={16} />
          {locale === 'ar' ? 'المدونة' : 'Blog'}
        </Link>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-[var(--brand-text)] mb-6 sm:mb-10">
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
    </main>
  );
}
