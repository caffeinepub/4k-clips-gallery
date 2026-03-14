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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Film, Link, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAddClip, useAddClipFromUrl } from "../hooks/useQueries";
import { parseYouTubeId } from "../utils/youtube";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadDialog({ open, onClose }: Props) {
  // Upload File tab state
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Paste Link tab state
  const [linkTitle, setLinkTitle] = useState("");
  const [linkCaption, setLinkCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(5);
  const [creatingProgress, setCreatingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const addClip = useAddClip();
  const addClipFromUrl = useAddClipFromUrl();

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
    setLinkTitle("");
    setLinkCaption("");
    setLinkUrl("");
    setVideoDuration(5);
    setCreatingProgress(null);
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

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    const youtubeId = parseYouTubeId(linkUrl.trim());

    try {
      if (youtubeId) {
        const totalClips = Math.max(1, Math.round(videoDuration));
        for (let n = 0; n < totalClips; n++) {
          setCreatingProgress({ current: n + 1, total: totalClips });
          const embedUrl = `https://www.youtube.com/embed/${youtubeId}?start=${n * 60}&end=${(n + 1) * 60}`;
          const partTitle =
            totalClips > 1
              ? `${linkTitle.trim()} — Part ${n + 1}`
              : linkTitle.trim();
          await addClipFromUrl.mutateAsync({
            title: partTitle,
            caption: linkCaption.trim(),
            url: embedUrl,
          });
        }
        toast.success(
          `${totalClips} clip${totalClips > 1 ? "s" : ""} created successfully!`,
        );
      } else {
        setCreatingProgress({ current: 1, total: 1 });
        await addClipFromUrl.mutateAsync({
          title: linkTitle.trim(),
          caption: linkCaption.trim(),
          url: linkUrl.trim(),
        });
        toast.success("Clip created successfully!");
      }
      reset();
      onClose();
    } catch {
      toast.error("Failed to create clip. Please try again.");
      setCreatingProgress(null);
    }
  };

  const handleClose = () => {
    if (!addClip.isPending && !addClipFromUrl.isPending) {
      reset();
      onClose();
    }
  };

  const isLinkYouTube = !!parseYouTubeId(linkUrl);
  const isLinkPending = addClipFromUrl.isPending || creatingProgress !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Add Clip
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-2">
          <TabsList className="w-full bg-muted/60 border border-border mb-5">
            <TabsTrigger
              value="upload"
              className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="upload.tab"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="link.tab"
            >
              <Link className="h-3.5 w-3.5" />
              Paste Link
            </TabsTrigger>
          </TabsList>

          {/* ── Upload File tab ── */}
          <TabsContent value="upload">
            <form onSubmit={handleSubmit} className="space-y-5">
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
          </TabsContent>

          {/* ── Paste Link tab ── */}
          <TabsContent value="link">
            <form onSubmit={handleLinkSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="link-title"
                  className="text-sm text-muted-foreground uppercase tracking-wider"
                >
                  Title
                </Label>
                <Input
                  id="link-title"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Enter clip title…"
                  className="bg-input border-border focus:ring-ring"
                  required
                  data-ocid="link.input"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="link-caption"
                  className="text-sm text-muted-foreground uppercase tracking-wider"
                >
                  Caption / Subtitle
                </Label>
                <Textarea
                  id="link-caption"
                  value={linkCaption}
                  onChange={(e) => setLinkCaption(e.target.value)}
                  placeholder="Enter caption text shown as subtitle…"
                  rows={2}
                  className="bg-input border-border focus:ring-ring resize-none"
                  data-ocid="link.textarea"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="link-url"
                  className="text-sm text-muted-foreground uppercase tracking-wider"
                >
                  Video URL
                </Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Paste YouTube or video URL…"
                    className="bg-input border-border focus:ring-ring pl-9"
                    required
                    data-ocid="link.input"
                  />
                </div>
                {isLinkYouTube && (
                  <p className="text-xs text-primary flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    YouTube link detected — will create 1-minute clips
                  </p>
                )}
              </div>

              {isLinkYouTube && (
                <div className="space-y-2">
                  <Label
                    htmlFor="link-duration"
                    className="text-sm text-muted-foreground uppercase tracking-wider"
                  >
                    Video duration (minutes)
                  </Label>
                  <Input
                    id="link-duration"
                    type="number"
                    min={1}
                    max={120}
                    value={videoDuration}
                    onChange={(e) =>
                      setVideoDuration(Number(e.target.value) || 1)
                    }
                    className="bg-input border-border focus:ring-ring w-32"
                    data-ocid="link.input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Creates{" "}
                    <span className="text-foreground font-medium">
                      {Math.max(1, Math.round(videoDuration))} clip
                      {Math.max(1, Math.round(videoDuration)) > 1 ? "s" : ""}
                    </span>{" "}
                    of 1 minute each
                  </p>
                </div>
              )}

              {isLinkPending && creatingProgress && (
                <div className="space-y-2" data-ocid="link.loading_state">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating clip {creatingProgress.current} of{" "}
                      {creatingProgress.total}…
                    </span>
                    <span>
                      {Math.round(
                        (creatingProgress.current / creatingProgress.total) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (creatingProgress.current / creatingProgress.total) * 100
                    }
                    className="h-1.5"
                  />
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLinkPending}
                  className="border-border"
                  data-ocid="link.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLinkPending || !linkTitle.trim() || !linkUrl.trim()
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  data-ocid="link.submit_button"
                >
                  {isLinkPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {creatingProgress
                        ? `Creating ${creatingProgress.current}/${creatingProgress.total}…`
                        : "Creating…"}
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4" />
                      {isLinkYouTube
                        ? `Create ${Math.max(1, Math.round(videoDuration))} Clip${
                            Math.max(1, Math.round(videoDuration)) > 1
                              ? "s"
                              : ""
                          }`
                        : "Create Clip"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
