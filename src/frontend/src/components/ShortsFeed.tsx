import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Film, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoClip } from "../backend.d";
import ShortsPlayer from "./ShortsPlayer";

const SKELETON_KEYS = Array.from({ length: 3 }, (_, i) => `sk-${i}`);

interface Props {
  clips: VideoClip[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpload: () => void;
}

export default function ShortsFeed({
  clips,
  isLoading,
  isAdmin,
  onDelete,
  onUpload,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver to track which clip is visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !clips?.length) return;

    const observers: IntersectionObserver[] = [];

    for (let i = 0; i < clips.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const idx = i;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(idx);
          }
        },
        { root: container, threshold: 0.6 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => {
      for (const o of observers) o.disconnect();
    };
  }, [clips]);

  const scrollTo = useCallback((idx: number) => {
    const el = itemRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => {
    if (!clips) return;
    const next = Math.min(activeIndex + 1, clips.length - 1);
    scrollTo(next);
  }, [activeIndex, clips, scrollTo]);

  const goPrev = useCallback(() => {
    const prev = Math.max(activeIndex - 1, 0);
    scrollTo(prev);
  }, [activeIndex, scrollTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Loading skeletons
  if (isLoading) {
    return (
      <div
        className="h-screen bg-black flex items-center justify-center"
        data-ocid="shorts.loading_state"
      >
        <div className="max-w-[420px] w-full mx-auto h-screen relative">
          {SKELETON_KEYS.map((k, i) => (
            <div
              key={k}
              className="absolute inset-0 flex flex-col gap-3"
              style={{ opacity: 1 - i * 0.3 }}
            >
              <Skeleton className="w-full h-full bg-white/5 rounded-none" />
            </div>
          ))}
          <div className="absolute bottom-24 left-4 right-4 space-y-2">
            <Skeleton className="h-5 w-2/3 bg-white/10" />
            <Skeleton className="h-8 w-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!clips || clips.length === 0) {
    return (
      <motion.div
        className="h-screen bg-black flex flex-col items-center justify-center gap-6 text-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        data-ocid="shorts.empty_state"
      >
        <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
          <Film className="w-10 h-10 text-white/30" />
        </div>
        <div>
          <h2 className="font-display font-black text-white text-2xl mb-2">
            No Shorts Yet
          </h2>
          <p className="text-white/40 text-sm">
            {isAdmin
              ? "Upload your first 4K clip to get started."
              : "Check back soon — clips will appear here."}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={onUpload}
            className="gap-2 bg-primary text-primary-foreground font-bold"
            data-ocid="shorts.primary_button"
          >
            <Plus className="w-4 h-4" />
            Upload First Clip
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Snap scroll feed */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        data-ocid="shorts.list"
      >
        {clips.map((clip, i) => (
          <div
            key={clip.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <ShortsPlayer
              clip={clip}
              index={i}
              isActive={activeIndex === i}
              isAdmin={isAdmin}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {/* Position indicator */}
      <div className="fixed top-20 right-4 z-50 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none">
        {activeIndex + 1} / {clips.length}
      </div>

      {/* Vertical nav arrows */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <button
          type="button"
          className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="Previous clip"
          data-ocid="shorts.pagination_prev"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          onClick={goNext}
          disabled={activeIndex === clips.length - 1}
          aria-label="Next clip"
          data-ocid="shorts.pagination_next"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
