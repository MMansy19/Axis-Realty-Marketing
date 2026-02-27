import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Blog } from '@/lib/types/blog';

interface BlogCardProps {
  blog: Blog;
  locale: string;
}

export default function BlogCard({ blog, locale }: BlogCardProps) {
  const title = locale === 'ar' ? blog.title_ar : blog.title_en;
  const coverImage = blog.blog_images?.[0];

  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <div className="bg-[var(--brand-bg)] rounded-sm overflow-hidden border border-[var(--brand-light)]/5 hover:border-[var(--brand-accent)]/30 transition-all duration-500 hover:-translate-y-2 shadow-lg">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[var(--brand-olive)]">
          {coverImage ? (
            <Image
              src={coverImage.thumbnail_url || coverImage.url}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--brand-muted)]">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
        </div>
        <div className="p-6">
          <h3 className="font-serif text-xl font-bold text-[var(--brand-text)] line-clamp-2">
            {title}
          </h3>
          {blog.video_url && (
            <span className="inline-block mt-2 text-xs text-[var(--brand-accent)] bg-[var(--brand-accent)]/10 px-2 py-1 rounded">
              🎬 {locale === 'ar' ? 'يحتوي على فيديو' : 'Includes video'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
