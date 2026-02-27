import { Inter } from 'next/font/google';
import Image from 'next/image';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Admin | Imperium Developments',
  description: 'Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="font-sans bg-[#0B0F14] text-[#F6F5F3] antialiased min-h-screen flex flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md border-b border-[#F6F5F3]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center gap-3">
            <a href="/admin/dashboard" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="Imperium Developments"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
                priority
                quality={100}
              />
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg tracking-widest text-[#F6F5F3] leading-none uppercase">
                  Imperium
                </span>
                <span className="text-[0.55rem] sm:text-[0.65rem] tracking-[0.2em] text-[#C79E3D] uppercase">
                  Admin Panel
                </span>
              </div>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="border-t border-[#F6F5F3]/5 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#9AA0A6] text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} Imperium Developments. All rights reserved.
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
