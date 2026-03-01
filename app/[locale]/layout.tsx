import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {Inter, Cinzel, Cairo} from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-arabic',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

const BASE_URL = 'https://axis-realty-marketing.vercel.app';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const isAr = locale === 'ar';
  const altLocale = isAr ? 'en' : 'ar';

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: isAr
        ? 'أكسيس ريلتي ماركتنج | تسويق عقاري استراتيجي وإدارة مبيعات'
        : 'AXIS REALTY MARKETING | Strategic Real Estate Marketing & Sales Management',
      template: isAr
        ? '%s | أكسيس ريلتي ماركتنج'
        : '%s | AXIS REALTY MARKETING',
    },
    description: isAr
      ? 'شريكك الاستراتيجي في تسويق المشاريع العقارية وإدارة المبيعات. نبني الطلب، ندير المبيعات، ونحقق النتائج للمطورين الطموحين في مصر.'
      : 'Your strategic partner in real estate project marketing and sales management. We build demand, drive sales, and deliver results for ambitious developers in Egypt.',
    keywords: isAr
      ? [
          'تسويق عقاري مصر',
          'إدارة مبيعات المشاريع',
          'توليد عملاء محتملين عقاريين',
          'وكالة تسويق عقاري',
          'أكسيس ريلتي ماركتنج',
        ]
      : [
          'Real Estate Marketing Company Egypt',
          'Project Sales Management',
          'Real Estate Lead Generation',
          'Property Marketing Agency',
          'Axis Realty Marketing',
        ],
    openGraph: {
      title: isAr
        ? 'أكسيس ريلتي ماركتنج | تسويق عقاري استراتيجي'
        : 'AXIS REALTY MARKETING | Strategic Real Estate Marketing',
      description: isAr
        ? 'نبني الطلب. ندير المبيعات. شريك النمو الاستراتيجي للمطورين العقاريين.'
        : 'We Build Demand. We Drive Sales. Strategic Growth Partner for Real Estate Developers.',
      type: 'website',
      siteName: 'AXIS REALTY MARKETING',
      locale: isAr ? 'ar_EG' : 'en_US',
      url: `${BASE_URL}/${locale}`,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'AXIS REALTY MARKETING',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr ? 'أكسيس ريلتي ماركتنج' : 'AXIS REALTY MARKETING',
      description: isAr
        ? 'تسويق عقاري استراتيجي وإدارة مبيعات'
        : 'Strategic Real Estate Marketing & Sales Management',
      images: ['/opengraph-image'],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        [locale]: `${BASE_URL}/${locale}`,
        [altLocale]: `${BASE_URL}/${altLocale}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${inter.variable} ${cinzel.variable} ${cairo.variable}`}>
      <body className={`font-sans bg-[var(--brand-bg)] text-[var(--brand-text)] antialiased selection:bg-[var(--brand-accent)]/30 ${locale === 'ar' ? 'font-arabic' : ''}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
