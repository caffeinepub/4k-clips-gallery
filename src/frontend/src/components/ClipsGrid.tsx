import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";
import type { VideoClip } from "../backend.d";
import ClipCard from "./ClipCard";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

interface Props {
  clips?: VideoClip[];
  isLoading?: boolean;
  canDelete?: boolean;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export default function ClipsGrid({
  clips,
  isLoading,
  canDelete = false,
  onDelete,
  emptyMessage = "No clips yet. Upload your first video to get started.",
}: Props) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        data-ocid="clips.loading_state"
      >
        {SKELETON_KEYS.map((k) => (
          <div
            key={k}
            className="bg-card border border-border/50 rounded-2xl overflow-hidden"
          >
            <Skeleton className="aspect-video w-full shimmer" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4 shimmer" />
              <Skeleton className="h-3 w-full shimmer" />
              <Skeleton className="h-3 w-1/2 shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!clips || clips.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        data-ocid="clips.empty_state"
      >
        <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-4">
          <Film className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-display font-bold text-foreground text-lg mb-2">
          No Clips Found
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      data-ocid="clips.list"
    >
      {clips.map((clip, i) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          canDelete={canDelete}
          onDelete={onDelete}
          index={i + 1}
        />
      ))}
    </div>
  );
}
