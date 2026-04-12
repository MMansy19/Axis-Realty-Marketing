'use client';

import {useEffect, useRef, useState, useCallback} from 'react';

interface VideoProgressProps {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
}

export default function VideoProgress({videoElement, isActive}: VideoProgressProps) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    if (videoElement && videoElement.duration > 0) {
      setProgress((videoElement.currentTime / videoElement.duration) * 100);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [videoElement]);

  useEffect(() => {
    if (isActive && videoElement) {
      rafRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, videoElement, updateProgress]);

  if (!isActive) return null;

  return (
    <div className="absolute top-0 inset-x-0 z-40 h-[3px] bg-white/20">
      <div
        className="h-full bg-[var(--brand-accent)] transition-none"
        style={{width: `${progress}%`}}
      />
    </div>
  );
}
