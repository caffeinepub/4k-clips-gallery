import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Film, Trash2 } from "lucide-react";
import { AspectRatio } from "../backend";
import type { VideoClip } from "../backend.d";

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

function getAspectBadge(ar: AspectRatio) {
  switch (ar) {
    case AspectRatio._9_16:
      return {
        label: "9:16 Shorts",
        cls: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      };
    case AspectRatio._16_9:
      return {
        label: "16:9 Landscape",
        cls: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      };
    case AspectRatio._1_1:
      return {
        label: "1:1 Square",
        cls: "bg-green-500/20 text-green-300 border-green-500/30",
      };
    default:
      return {
        label: "Video",
        cls: "bg-secondary text-secondary-foreground border-border",
      };
  }
}

function formatDate(time: bigint): string {
  return new Date(Number(time / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  clip: VideoClip;
  canDelete: boolean;
  onDelete: (id: string) => void;
  index: number;
}

export default function ClipCard({ clip, canDelete, onDelete, index }: Props) {
  const badge = getAspectBadge(clip.aspectRatio);
  const ytId = clip.videoUrl ? getYouTubeId(clip.videoUrl) : null;
  const isYouTube = !!ytId;

  const handleDownload = () => {
    if (clip.videoBlob) {
      const url = clip.videoBlob.getDirectURL();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clip.title.replace(/\s+/g, "-")}.mp4`;
      a.click();
    } else if (clip.videoUrl) {
      window.open(clip.videoUrl, "_blank");
    }
  };

  return (
    <div
      className="clip-card group relative bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col"
      data-ocid={`clips.item.${index}`}
    >
      {/* Video area */}
      <div className="relative aspect-video bg-muted flex-shrink-0 overflow-hidden">
        {isYouTube ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
            title={clip.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : clip.videoBlob ? (
          // biome-ignore lint/a11y/useMediaCaption: captions optional for user-uploaded clips
          <video
            src={clip.videoBlob.getDirectURL()}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        ) : clip.videoUrl ? (
          // biome-ignore lint/a11y/useMediaCaption: captions optional for user-uploaded clips
          <video
            src={clip.videoUrl}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${badge.cls}`}
          >
            {badge.label}
          </span>
        </div>

        {clip.partNumber !== undefined && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm">
              Part {String(clip.partNumber)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display font-bold text-foreground text-sm leading-tight line-clamp-2">
          {clip.title}
        </h3>
        {clip.caption && (
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
            {clip.caption}
          </p>
        )}
        <p className="text-muted-foreground/60 text-xs mt-auto pt-1">
          {formatDate(clip.uploadTime)}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 border-border text-foreground hover:bg-secondary text-xs"
          onClick={handleDownload}
          data-ocid={`clips.edit_button.${index}`}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </Button>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60"
                data-ocid={`clips.delete_button.${index}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="bg-popover border-border"
              data-ocid="clips.dialog"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display font-black">
                  Delete Clip?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action cannot be undone. The clip will be permanently
                  deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="border-border"
                  data-ocid="clips.cancel_button"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(clip.id)}
                  data-ocid="clips.confirm_button"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
