import {setRequestLocale, getTranslations} from 'next-intl/server';
import {supabase, isSupabaseConfigured} from '@/lib/supabase';
import {getCloudinaryPoster} from '@/lib/cloudinary-url';
import VideoFeed from '@/components/reels/VideoFeed';
import type {ReelVideo} from '@/components/reels/VideoFeed';
import type {Metadata} from 'next';

interface PageProps {
  params: Promise<{locale: string}>;
}

const BASE_URL = 'https://www.axisrealty.org';

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  const isAr = locale === 'ar';
  const altLocale = isAr ? 'en' : 'ar';

  const title = isAr ? 'ريلز | AXIS REALTY MARKETING' : 'Reels | AXIS REALTY MARKETING';
  const description = isAr
    ? 'شاهد أحدث الفيديوهات العقارية من أكسيس ريلتي ماركتنج — جولات مشاريع، عروض حصرية، وأحدث التطورات.'
    : 'Watch the latest real estate videos from AXIS REALTY MARKETING — project tours, exclusive offers, and the latest developments.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'AXIS REALTY MARKETING',
      locale: isAr ? 'ar_EG' : 'en_US',
      url: `${BASE_URL}/${locale}/reels`,
      images: [{url: '/opengraph-image', width: 1200, height: 630, alt: 'AXIS REALTY MARKETING Reels'}],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/reels`,
      languages: {
        [locale]: `${BASE_URL}/${locale}/reels`,
        [altLocale]: `${BASE_URL}/${altLocale}/reels`,
      },
    },
  };
}

export default async function ReelsPage({params}: PageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Index'});
  const isAr = locale === 'ar';

  let videos: ReelVideo[] = [];

  if (isSupabaseConfigured()) {
    try {
      const {data: blogs} = await supabase
        .from('blogs')
        .select('id, slug, title_en, title_ar, video_url, created_at, blog_images(url, thumbnail_url, display_order)')
        .eq('is_published', true)
        .not('video_url', 'is', null)
        .order('display_order', {ascending: true})
        .order('created_at', {ascending: false});

      videos = (blogs || [])
        .filter((blog) => blog.video_url)
        .map((blog) => {
          const images = (blog.blog_images || []).sort(
            (a: {display_order: number}, b: {display_order: number}) => a.display_order - b.display_order
          );
          return {
            id: blog.id,
            slug: blog.slug,
            title: isAr ? blog.title_ar : blog.title_en,
            videoUrl: blog.video_url!,
            date: blog.created_at,
            thumbnailUrl: images[0]?.thumbnail_url || images[0]?.url || undefined,
          };
        });
    } catch (e) {
      console.error('Failed to fetch reels:', e);
    }
  }

  const translations = {
    reels_book_now: t('reels_book_now'),
    reels_mute: t('reels_mute'),
    reels_unmute: t('reels_unmute'),
    reels_share: t('reels_share'),
    reels_view_details: t('reels_view_details'),
    reels_copied: t('reels_copied'),
  };

  if (videos.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center">
        <p className="text-[var(--brand-muted)] text-lg">{t('reels_no_videos')}</p>
      </main>
    );
  }

  return (
    <>
      <main className="h-dvh bg-black overflow-hidden">
        <VideoFeed videos={videos} locale={locale} translations={translations} />
      </main>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: isAr ? 'ريلز أكسيس ريلتي' : 'AXIS REALTY Reels',
            numberOfItems: videos.length,
            itemListElement: videos.map((video, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'VideoObject',
                name: video.title,
                contentUrl: video.videoUrl,
                thumbnailUrl: getCloudinaryPoster(video.videoUrl),
                uploadDate: video.date,
                publisher: {
                  '@type': 'Organization',
                  name: 'AXIS REALTY MARKETING',
                  url: BASE_URL,
                },
              },
            })),
          }),
        }}
      />
    </>
  );
}
