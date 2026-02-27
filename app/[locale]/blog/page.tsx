import {setRequestLocale, getTranslations} from 'next-intl/server';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import BlogCard from '@/components/BlogCard';
import type {Blog} from '@/lib/types/blog';
import {Link} from '@/i18n/routing';
import {ArrowLeft} from 'lucide-react';

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
      <div className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--brand-muted)] hover:text-[var(--brand-accent)] transition-colors mb-8 sm:mb-12 text-sm">
          <ArrowLeft size={16} />
          {locale === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>

        <div className="text-center mb-10 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-text)] mb-4 sm:mb-6">
            {t('blog_section_title')}
          </h1>
          <div className="w-16 sm:w-20 h-1 bg-[var(--brand-accent)] mx-auto"></div>
        </div>

        {publishedBlogs.length === 0 ? (
          <p className="text-center text-[var(--brand-muted)]">
            {locale === 'ar' ? 'لا توجد مقالات بعد' : 'No blogs yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {publishedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
