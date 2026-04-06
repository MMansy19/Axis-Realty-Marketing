import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://axis-realty-marketing.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['en', 'ar'];
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/${locale}/blog`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${locale}/projects/finishing`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]);

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: blogs } = await supabase
      .from('blogs')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (blogs) {
      blogPages = blogs.flatMap((blog) =>
        locales.map((locale) => ({
          url: `${BASE_URL}/${locale}/blog/${blog.slug}`,
          lastModified: new Date(blog.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      );
    }
  } catch {
    // Supabase unavailable at build time — skip dynamic pages
  }

  return [...staticPages, ...blogPages];
}
