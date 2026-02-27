import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {Inter, Playfair_Display, Cairo} from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-arabic',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata = {
  title: 'Imperium Developments | Real Estate Development Company in Egypt',
  description: 'We design premium residential communities that combine elegance, comfort and long-term value.',
};

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
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${inter.variable} ${playfair.variable} ${cairo.variable}`}>
      <body className={`font-sans bg-[var(--brand-bg)] text-[var(--brand-text)] antialiased selection:bg-[var(--brand-accent)]/30 ${locale === 'ar' ? 'font-arabic' : ''}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
