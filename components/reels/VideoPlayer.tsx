'use client';

import {useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle} from 'react';
import {Play, Pause} from 'lucide-react';
import {getCloudinaryPoster, getOptimizedVideoUrl} from '@/lib/cloudinary-url';

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  reset: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}

interface VideoPlayerProps {
  videoUrl: string;
  isActive: boolean;
  isAdjacent: boolean;
  isMuted: boolean;
  index: number;
  reducedMotion: boolean;
  onTapToggle: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  {videoUrl, isActive, isAdjacent, isMuted, index, reducedMotion, onTapToggle},
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const playIconTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const poster = getCloudinaryPoster(videoUrl);
  const optimizedUrl = getOptimizedVideoUrl(videoUrl);

  // Whether this video should have its src loaded
  const shouldLoad = isActive || isAdjacent;

  useImperativeHandle(ref, () => ({
    play: async () => {
      const video = videoRef.current;
      if (!video || reducedMotion) return;
      try {
        await video.play();
        setIsPlaying(true);
        setNeedsTapToPlay(false);
      } catch {
        // Autoplay blocked by browser
        setNeedsTapToPlay(true);
        setIsPlaying(false);
      }
    },
    pause: () => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      setIsPlaying(false);
    },
    reset: () => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
    },
    getVideoElement: () => videoRef.current,
  }));

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle active state changes
  useEffect(() => {
    if (!isActive) {
      setVideoReady(false);
      setNeedsTapToPlay(false);
    }
  }, [isActive]);

  const handleCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (needsTapToPlay) {
      video.play().then(() => {
        setIsPlaying(true);
        setNeedsTapToPlay(false);
      }).catch(() => {});
      return;
    }

    onTapToggle();

    // Show play/pause indicator
    setShowPlayIcon(true);
    if (playIconTimeout.current) clearTimeout(playIconTimeout.current);
    playIconTimeout.current = setTimeout(() => setShowPlayIcon(false), 600);

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [needsTapToPlay, onTapToggle]);

  return (
    <div className="relative h-dvh w-full snap-start bg-black overflow-hidden">
      {/* Poster image - always visible as bg, fades out when video is ready */}
      <img
        src={poster}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoReady && isActive && isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
        loading={index <= 1 ? 'eager' : 'lazy'}
        draggable={false}
      />

      {/* Video element */}
      {shouldLoad && !reducedMotion && (
        <video
          ref={videoRef}
          src={optimizedUrl}
          poster={poster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          playsInline
          loop
          muted={isMuted}
          preload={index === 0 ? 'metadata' : 'none'}
          onCanPlay={handleCanPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-hidden="true"
        />
      )}

      {/* Tap area */}
      <button
        className="absolute inset-0 w-full h-full z-10 cursor-pointer bg-transparent border-none outline-none"
        onClick={handleTap}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        tabIndex={isActive ? 0 : -1}
      />

      {/* Play/Pause indicator on tap */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/50 rounded-full p-5 animate-[fadeOut_0.6s_ease-out_forwards]">
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" fill="white" />
            ) : (
              <Play className="w-10 h-10 text-white" fill="white" />
            )}
          </div>
        </div>
      )}

      {/* Tap to play overlay (autoplay blocked) */}
      {needsTapToPlay && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/60 rounded-2xl px-6 py-4 flex flex-col items-center gap-2">
            <Play className="w-12 h-12 text-white" fill="white" />
            <span className="text-white text-sm font-medium">Tap to play</span>
          </div>
        </div>
      )}

      {/* Reduced motion: static poster with overlay message */}
      {reducedMotion && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/60 rounded-2xl px-6 py-4">
            <span className="text-white text-sm">Video paused (reduced motion)</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;
