import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Play, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { VideoClip } from "../backend.d";
import { getYouTubeThumbnail, isYouTubeEmbed } from "../utils/youtube";
import ShortsPlayer from "./ShortsPlayer";

interface Props {
  clips: VideoClip[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpload: () => void;
}

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `sk-${i}`);

export default function ClipsGrid({
  clips,
  isLoading,
  isAdmin,
  onDelete,
  onUpload,
}: Props) {
  const [activeClip, setActiveClip] = useState<VideoClip | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const openPlayer = (clip: VideoClip, index: number) => {
    setActiveClip(clip);
    setActiveIndex(index);
  };

  const closePlayer = () => setActiveClip(null);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        data-ocid="clips.loading_state"
      >
        {SKELETON_IDS.map((k) => (
          <div
            key={k}
            className="rounded-xl overflow-hidden bg-card border border-border/50"
          >
            <div className="shimmer" style={{ aspectRatio: "9/16" }} />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3.5 w-3/4 bg-white/8" />
              <Skeleton className="h-3 w-1/2 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!clips || clips.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-6 py-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        data-ocid="clips.empty_state"
      >
        <div className="w-20 h-20 rounded-2xl border border-border flex items-center justify-center">
          <Film className="w-9 h-9 text-muted-foreground/40" />
        </div>
        <div>
          <h3 className="font-display font-black text-xl text-foreground mb-2">
            No Clips Yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            {isAdmin
              ? "Add your first 4K clip via upload or YouTube link."
              : "Clips will appear here when published."}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={onUpload}
            className="gap-2 bg-primary text-primary-foreground font-bold"
            data-ocid="clips.primary_button"
          >
            <Plus className="w-4 h-4" />
            Upload First Clip
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        data-ocid="clips.list"
      >
        {clips.map((clip, index) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            index={index}
            isAdmin={isAdmin}
            onPlay={() => openPlayer(clip, index)}
            onDelete={() => onDelete(clip.id)}
          />
        ))}
      </motion.div>

      {/* Full-screen player overlay */}
      <AnimatePresence>
        {activeClip && (
          <ShortsPlayer
            clip={activeClip}
            index={activeIndex}
            isAdmin={isAdmin}
            onDelete={(id) => {
              onDelete(id);
              closePlayer();
            }}
            onClose={closePlayer}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Individual Clip Card ──────────────────────────────────────────────────────

interface CardProps {
  clip: VideoClip;
  index: number;
  isAdmin: boolean;
  onPlay: () => void;
  onDelete: () => void;
}

function ClipCard({ clip, index, isAdmin, onPlay, onDelete }: CardProps) {
  const videoUrl = clip.videoUrl ?? clip.videoBlob?.getDirectURL() ?? "";
  const isYT = isYouTubeEmbed(videoUrl);
  const thumbnail = isYT ? getYouTubeThumbnail(videoUrl) : "";

  const partMatch = clip.title.match(/[—\-–]\s*Part\s*(\d+)/i);
  const partNum = partMatch ? partMatch[1] : null;
  const baseTitle = partMatch
    ? clip.title.replace(partMatch[0], "").trim()
    : clip.title;

  return (
    <motion.div
      className="clip-card group relative rounded-xl overflow-hidden bg-card border border-border/50 cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      onClick={onPlay}
      data-ocid={`clips.item.${index + 1}`}
    >
      {/* 9:16 Thumbnail */}
      <div
        className="relative w-full overflow-hidden bg-muted"
        style={{ aspectRatio: "9/16" }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={baseTitle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Play button (shows on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Part badge */}
        {partNum && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
              Part {partNum}
            </span>
          </div>
        )}

        {/* Admin delete button */}
        {isAdmin && (
          <button
            type="button"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete clip"
            data-ocid={`clips.delete_button.${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-display font-bold text-white text-sm leading-tight line-clamp-2">
            {baseTitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
