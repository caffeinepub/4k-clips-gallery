import { Trash2, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoClip } from "../backend.d";
import {
  type CaptionPhrase,
  generateCaptions,
  getActiveCaptionPhrase,
} from "../utils/captions";
import { isYouTubeEmbed } from "../utils/youtube";

interface Props {
  clip: VideoClip;
  index: number;
  isActive: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function ShortsPlayer({
  clip,
  index,
  isActive,
  isAdmin,
  onDelete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [currentSec, setCurrentSec] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const videoUrl = clip.videoUrl ?? clip.videoBlob?.getDirectURL() ?? "";
  const isYT = isYouTubeEmbed(videoUrl);

  const captions: CaptionPhrase[] = generateCaptions(clip.title, clip.caption);
  const activeCaption = getActiveCaptionPhrase(captions, currentSec);

  // Auto-play/pause native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setCurrentSec(0);
    }
  }, [isActive]);

  // Force iframe reload when becoming active (YouTube autoplay)
  useEffect(() => {
    if (isYT && isActive) {
      setIframeKey((k) => k + 1);
    }
  }, [isActive, isYT]);

  // Track playback time every 250ms for captions (native video)
  useEffect(() => {
    if (!isActive || isYT) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video) setCurrentSec(video.currentTime);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, isYT]);

  // For YouTube: simulate time progression (no dependency on iframeKey to avoid re-run warning)
  useEffect(() => {
    if (!isActive || !isYT) return;
    setCurrentSec(0);
    const interval = setInterval(() => {
      setCurrentSec((prev) => (prev >= 60 ? 0 : prev + 0.25));
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isYT]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  }, []);

  // Extract part number from title like "Video — Part 3"
  const partMatch = clip.title.match(/[—\-–]\s*Part\s*(\d+)/i);
  const partNum = partMatch ? partMatch[1] : null;
  const baseTitle = partMatch
    ? clip.title.replace(partMatch[0], "").trim()
    : clip.title;

  const ytSrc = isActive
    ? `${videoUrl}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1`
    : `${videoUrl}?autoplay=0`;

  return (
    <div
      className="relative w-full h-screen bg-black flex items-center justify-center snap-start snap-always flex-shrink-0"
      data-ocid={`shorts.item.${index + 1}`}
    >
      {/* 9:16 Video Container */}
      <div
        className="relative h-full max-w-[420px] w-full mx-auto"
        style={{ aspectRatio: "9/16" }}
      >
        {isYT ? (
          <iframe
            key={iframeKey}
            src={ytSrc}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={clip.title}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted={muted}
            loop
            playsInline
            preload="metadata"
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* TOP ROW: mute button + admin delete */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            data-ocid="shorts.toggle"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {isAdmin && (
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-red-500/70 backdrop-blur-sm border border-red-400/30 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(clip.id);
              }}
              aria-label="Delete clip"
              data-ocid={`shorts.delete_button.${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* BOTTOM INFO */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6">
          {/* Title row */}
          <div className="flex items-end justify-between gap-3 mb-3">
            <h2
              className="font-display font-black text-white text-base leading-tight max-w-[75%]"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
            >
              {baseTitle}
            </h2>
            {partNum && (
              <span className="shrink-0 bg-primary/90 text-primary-foreground text-xs font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
                Part {partNum}
              </span>
            )}
          </div>

          {/* Animated Caption */}
          <div className="min-h-[3.5rem] flex items-end">
            <AnimatePresence mode="wait">
              {activeCaption && (
                <motion.p
                  key={activeCaption.text}
                  className="font-body font-black text-white text-xl leading-tight tracking-wide uppercase"
                  style={{
                    textShadow:
                      "0 0 8px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,1), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {activeCaption.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Black bars left/right on wide screens */}
      <div className="absolute inset-0 -z-0 bg-black pointer-events-none" />
    </div>
  );
}
