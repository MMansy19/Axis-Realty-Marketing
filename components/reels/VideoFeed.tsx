'use client';

import {useRef, useState, useEffect, useCallback} from 'react';
import VideoPlayer, {type VideoPlayerHandle} from './VideoPlayer';
import VideoOverlay from './VideoOverlay';
import VideoProgress from './VideoProgress';

export interface ReelVideo {
  id: string;
  slug: string;
  title: string;
  videoUrl: string;
  date: string;
  thumbnailUrl?: string;
}

interface VideoFeedProps {
  videos: ReelVideo[];
  locale: string;
  translations: {
    reels_book_now: string;
    reels_mute: string;
    reels_unmute: string;
    reels_share: string;
    reels_view_details: string;
    reels_copied: string;
  };
}

export default function VideoFeed({videos, locale, translations}: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<(VideoPlayerHandle | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeVideoElement, setActiveVideoElement] = useState<HTMLVideoElement | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Intersection Observer — detect which video is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        }
      },
      {threshold: 0.6}
    );

    const slots = slotRefs.current;
    slots.forEach((slot) => {
      if (slot) observer.observe(slot);
    });

    return () => {
      slots.forEach((slot) => {
        if (slot) observer.unobserve(slot);
      });
    };
  }, [videos.length]);

  // Play/pause on active index change
  useEffect(() => {
    playerRefs.current.forEach((player, i) => {
      if (!player) return;
      if (i === activeIndex) {
        player.reset();
        player.play();
        setActiveVideoElement(player.getVideoElement());
      } else {
        player.pause();
        player.reset();
      }
    });
  }, [activeIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          {
            const player = playerRefs.current[activeIndex];
            const video = player?.getVideoElement();
            if (video) {
              if (video.paused) {
                player?.play();
              } else {
                player?.pause();
              }
            }
          }
          break;
        case 'm':
        case 'M':
          setIsMuted((prev) => !prev);
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          scrollToIndex(Math.min(activeIndex + 1, videos.length - 1));
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          scrollToIndex(Math.max(activeIndex - 1, 0));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, videos.length]);

  const scrollToIndex = useCallback((index: number) => {
    const slot = slotRefs.current[index];
    if (slot) {
      slot.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleTapToggle = useCallback(() => {
    // Tap toggle handled inside VideoPlayer
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {videos.map((video, index) => {
        const isActive = index === activeIndex;
        const isAdjacent = Math.abs(index - activeIndex) <= 1;

        return (
          <div
            key={video.id}
            ref={(el) => { slotRefs.current[index] = el; }}
            data-index={index}
            className="relative h-dvh w-full snap-start"
            role="region"
            aria-label={video.title}
          >
            <VideoPlayer
              ref={(el) => { playerRefs.current[index] = el; }}
              videoUrl={video.videoUrl}
              isActive={isActive}
              isAdjacent={isAdjacent}
              isMuted={isMuted}
              index={index}
              reducedMotion={reducedMotion}
              onTapToggle={handleTapToggle}
            />

            <VideoProgress
              videoElement={isActive ? activeVideoElement : null}
              isActive={isActive}
            />

            <VideoOverlay
              title={video.title}
              slug={video.slug}
              date={video.date}
              locale={locale}
              isActive={isActive}
              isMuted={isMuted}
              onMuteToggle={handleMuteToggle}
              translations={translations}
            />
          </div>
        );
      })}
    </div>
  );
}
