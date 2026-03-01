import { Inter, Cinzel } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'Admin | AXIS REALTY MARKETING',
  description: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans bg-[#0B0F14] text-[#F5F4F2] antialiased min-h-screen flex flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md border-b border-[#F5F4F2]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between">
            <a href="/admin/dashboard" className="flex items-center gap-2 sm:gap-3">
              <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg" aria-label="Axis">
                <line x1="50" y1="10" x2="50" y2="90" stroke="#C79E3D" strokeWidth="3" strokeLinecap="butt" />
                <line x1="16" y1="88" x2="45" y2="30" stroke="#F5F4F2" strokeWidth="3" strokeLinecap="butt" />
                <line x1="84" y1="88" x2="55" y2="30" stroke="#F5F4F2" strokeWidth="3" strokeLinecap="butt" />
                <line x1="28" y1="64" x2="45" y2="64" stroke="#F5F4F2" strokeWidth="3" strokeLinecap="butt" />
                <line x1="55" y1="64" x2="72" y2="64" stroke="#F5F4F2" strokeWidth="3" strokeLinecap="butt" />
              </svg>
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg tracking-widest text-[#F5F4F2] leading-none uppercase">
                  AXIS
                </span>
                <span className="text-[0.5rem] sm:text-[0.6rem] tracking-[0.2em] text-[#C79E3D] uppercase">
                  Admin Panel
                </span>
              </div>
            </a>
            <nav className="flex items-center gap-1 sm:gap-2">
              <a href="/admin/dashboard" className="px-3 py-2.5 text-xs sm:text-sm text-[#F5F4F2]/70 hover:text-[#C79E3D] transition-colors tracking-wide">Blogs</a>
              <a href="/admin/dashboard?tab=leads" className="px-3 py-2.5 text-xs sm:text-sm text-[#F5F4F2]/70 hover:text-[#C79E3D] transition-colors tracking-wide">Leads</a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="border-t border-[#F5F4F2]/5 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#9AA0A6] text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} AXIS REALTY MARKETING. All rights reserved.
            </p>
            <a href="/" className="text-[#9AA0A6] hover:text-[#C79E3D] transition-colors text-xs sm:text-sm">
              View Website &rarr;
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
