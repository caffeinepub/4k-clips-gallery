import { Button } from "@/components/ui/button";
import { Clock, Play, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { VideoClip } from "../backend.d";
import { getYouTubeThumbnail, isYouTubeEmbed } from "../utils/youtube";

interface Props {
  clip: VideoClip;
  index: number;
  isAdmin: boolean;
  onPlay: (clip: VideoClip) => void;
  onDelete: (id: string) => void;
}

export default function VideoCard({
  clip,
  index,
  isAdmin,
  onPlay,
  onDelete,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const videoUrl = clip.videoUrl ?? clip.videoBlob?.getDirectURL() ?? "";
  const isYT = isYouTubeEmbed(videoUrl);

  const formatTime = (time: bigint) => {
    const ms = Number(time / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const clipDuration =
    clip.startTime != null && clip.endTime != null
      ? (() => {
          const secs = clip.endTime - clip.startTime;
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return `${m}:${String(s).padStart(2, "0")}`;
        })()
      : null;

  const partNum = clip.partNumber != null ? Number(clip.partNumber) : null;

  return (
    <motion.article
      className="video-card bg-card rounded-xl overflow-hidden border border-border group cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(clip)}
      data-ocid={`clips.item.${index + 1}`}
    >
      {/* Thumbnail — 9:16 vertical ratio */}
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        {isYT ? (
          <img
            src={getYouTubeThumbnail(videoUrl)}
            className="w-full h-full object-cover"
            alt={clip.title}
          />
        ) : (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
        )}

        {/* Play overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-cinema-glow">
            <Play
              className="h-6 w-6 text-primary-foreground ml-0.5"
              fill="currentColor"
            />
          </div>
        </div>

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-black/70 text-primary text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">
            {isYT ? "YT" : "4K"}
          </div>
          {partNum != null && (
            <div className="bg-primary/90 text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
              Part {partNum}
            </div>
          )}
        </div>

        {/* Duration badge — bottom right */}
        {clipDuration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
            {clipDuration}
          </div>
        )}

        {isAdmin && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(clip.id);
            }}
            data-ocid={`clips.delete_button.${index + 1}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground truncate mb-1 leading-tight">
          {clip.title}
        </h3>
        {clip.caption && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {clip.caption}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/70">
          <Clock className="h-3 w-3" />
          <span>{formatTime(clip.uploadTime)}</span>
        </div>
      </div>
    </motion.article>
  );
}
