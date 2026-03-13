import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Film, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAddClip } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadDialog({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addClip = useAddClip();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("video/")) setFile(dropped);
  };

  const reset = () => {
    setTitle("");
    setCaption("");
    setFile(null);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) return;
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
    try {
      await addClip.mutateAsync({
        title: title.trim(),
        caption: caption.trim(),
        videoBytes: bytes,
        onProgress: setProgress,
      });
      toast.success("Clip uploaded successfully!");
      reset();
      onClose();
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleClose = () => {
    if (!addClip.isPending) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Upload 4K Clip
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="clip-title"
              className="text-sm text-muted-foreground uppercase tracking-wider"
            >
              Title
            </Label>
            <Input
              id="clip-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter clip title…"
              className="bg-input border-border focus:ring-ring"
              required
              data-ocid="upload.input"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="clip-caption"
              className="text-sm text-muted-foreground uppercase tracking-wider"
            >
              Caption / Subtitle
            </Label>
            <Textarea
              id="clip-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption text shown as subtitle…"
              rows={3}
              className="bg-input border-border focus:ring-ring resize-none"
              data-ocid="upload.textarea"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground uppercase tracking-wider block">
              Video File (4K supported)
            </span>
            {/* Label acts as semantic drop target + click-to-browse */}
            <label
              htmlFor="clip-video"
              className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragging
                  ? "border-primary bg-primary/10"
                  : file
                    ? "border-primary/60 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              data-ocid="upload.dropzone"
            >
              {file ? (
                <div className="flex items-center justify-center gap-3 text-primary">
                  <Film className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-medium truncate max-w-[220px]">
                    {file.name}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop video here or{" "}
                    <span className="text-primary">click to browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    MP4, MOV, WebM — up to 4K resolution
                  </p>
                </div>
              )}
            </label>
            <input
              ref={fileRef}
              id="clip-video"
              type="file"
              accept="video/*"
              onChange={handleFile}
              className="sr-only"
              data-ocid="upload.upload_button"
            />
          </div>

          {addClip.isPending && (
            <div className="space-y-2" data-ocid="upload.loading_state">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addClip.isPending}
              className="border-border"
              data-ocid="upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addClip.isPending || !title.trim() || !file}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="upload.submit_button"
            >
              {addClip.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload Clip
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
