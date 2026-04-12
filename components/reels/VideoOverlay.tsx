'use client';

import {useState, useCallback} from 'react';
import {Volume2, VolumeX, Share2, ExternalLink} from 'lucide-react';
import {Link} from '@/i18n/routing';
import {motion, AnimatePresence} from 'motion/react';

interface VideoOverlayProps {
  title: string;
  slug: string;
  date: string;
  locale: string;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  translations: {
    reels_book_now: string;
    reels_mute: string;
    reels_unmute: string;
    reels_share: string;
    reels_view_details: string;
    reels_copied: string;
  };
}

const WHATSAPP_PHONE = '201037217638';

export default function VideoOverlay({
  title,
  slug,
  date,
  locale,
  isActive,
  isMuted,
  onMuteToggle,
  translations,
}: VideoOverlayProps) {
  const [showCopied, setShowCopied] = useState(false);

  const blogUrl = `/${locale}/blog/${slug}`;
  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${blogUrl}`
    : '';

  const whatsappMessage = locale === 'ar'
    ? `مرحباً، أود الاستفسار عن: ${title}`
    : `Hello, I'd like to inquire about: ${title}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({title, url: fullUrl});
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(fullUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  }, [title, fullUrl]);

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Bottom gradient overlay with content */}
          <motion.div
            className="absolute bottom-0 inset-x-0 z-30 pointer-events-none"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 20}}
            transition={{duration: 0.3}}
          >
            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-24 pb-6 px-4 sm:px-6">
              <div className="max-w-lg pointer-events-auto">
                {/* Title */}
                <h2 className="text-white text-lg sm:text-xl font-bold leading-snug mb-2 line-clamp-2 drop-shadow-lg">
                  {title}
                </h2>

                {/* Date */}
                <p className="text-white/70 text-xs mb-4">
                  {new Date(date).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US',
                    {year: 'numeric', month: 'long', day: 'numeric'}
                  )}
                </p>

                {/* WhatsApp CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shadow-lg"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="white" className="shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {translations.reels_book_now}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right-side action bar */}
          <motion.div
            className="absolute end-3 sm:end-5 bottom-44 z-30 flex flex-col items-center gap-5"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            transition={{duration: 0.3, delay: 0.1}}
          >
            {/* Mute toggle */}
            <button
              onClick={onMuteToggle}
              className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label={isMuted ? translations.reels_mute : translations.reels_unmute}
              aria-pressed={!isMuted}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Share */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label={translations.reels_share}
              >
                <Share2 className="w-5 h-5" />
              </button>
              {showCopied && (
                <div className="absolute -start-20 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {translations.reels_copied}
                </div>
              )}
            </div>

            {/* View details */}
            <Link
              href={`/blog/${slug}`}
              className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label={translations.reels_view_details}
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
