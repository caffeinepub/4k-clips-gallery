import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Film, Info, Link, Loader2, Scissors, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AspectRatio } from "../backend";
import {
  type ClipSegment,
  type UrlClipSegment,
  useAddClipBatch,
  useAddClipFromUrl,
  useAddClipFromUrlBatch,
} from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CLIP_LENGTHS = [15, 30, 60] as const;
type ClipLength = (typeof CLIP_LENGTHS)[number];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function UploadDialog({ open, onClose }: Props) {
  const [tab, setTab] = useState("file");

  // ── File / clip-splitting state ──
  const [file, setFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileCaption, setFileCaption] = useState("");
  const [fileAspect, setFileAspect] = useState<AspectRatio>(AspectRatio._9_16);
  const [clipLength, setClipLength] = useState<ClipLength>(30);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [clipsCreated, setClipsCreated] = useState(0);
  const [totalClips, setTotalClips] = useState(0);

  // ── Link tab state ──
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkCaption, setLinkCaption] = useState("");
  const [linkAspect, setLinkAspect] = useState<AspectRatio>(AspectRatio._9_16);
  const [linkClipLength, setLinkClipLength] = useState<ClipLength>(30);
  const [linkDuration, setLinkDuration] = useState<number | null>(null);
  const [linkClipsCreated, setLinkClipsCreated] = useState(0);
  const [linkTotalClips, setLinkTotalClips] = useState(0);

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  const addClipBatch = useAddClipBatch();
  const addClipFromUrl = useAddClipFromUrl();
  const addClipFromUrlBatch = useAddClipFromUrlBatch();

  const isSubmitting =
    addClipBatch.isPending ||
    addClipFromUrl.isPending ||
    addClipFromUrlBatch.isPending;

  // Compute segments preview
  const numClips =
    videoDuration != null ? Math.ceil(videoDuration / clipLength) : 0;

  const linkNumClips =
    linkDuration != null && linkDuration > 0
      ? Math.ceil(linkDuration / linkClipLength)
      : 0;

  // Load duration when file changes
  useEffect(() => {
    if (!file) {
      setVideoDuration(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const vid = hiddenVideoRef.current;
    if (!vid) return;
    vid.src = url;
    const handler = () => {
      setVideoDuration(vid.duration);
      URL.revokeObjectURL(url);
    };
    vid.addEventListener("loadedmetadata", handler);
    vid.load();
    return () => {
      vid.removeEventListener("loadedmetadata", handler);
    };
  }, [file]);

  const resetAndClose = () => {
    setFile(null);
    setVideoDuration(null);
    setFileTitle("");
    setFileCaption("");
    setFileAspect(AspectRatio._9_16);
    setClipLength(30);
    setUploadProgress(0);
    setClipsCreated(0);
    setTotalClips(0);
    setLinkUrl("");
    setLinkTitle("");
    setLinkCaption("");
    setLinkAspect(AspectRatio._9_16);
    setLinkClipLength(30);
    setLinkDuration(null);
    setLinkClipsCreated(0);
    setLinkTotalClips(0);
    onClose();
  };

  const handleFileSubmit = async () => {
    if (!file || !fileTitle.trim()) {
      toast.error("Please provide a title and select a video file.");
      return;
    }
    const duration = videoDuration ?? 0;
    const segments: ClipSegment[] = [];
    const n = Math.max(1, Math.ceil(duration / clipLength));
    for (let i = 0; i < n; i++) {
      const start = i * clipLength;
      const end = Math.min((i + 1) * clipLength, duration || clipLength);
      segments.push({
        title: n > 1 ? `${fileTitle.trim()} — Part ${i + 1}` : fileTitle.trim(),
        caption: fileCaption.trim(),
        aspectRatio: fileAspect,
        partNumber: BigInt(i + 1),
        startTime: start,
        endTime: end,
      });
    }
    setTotalClips(segments.length);
    setClipsCreated(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await addClipBatch.mutateAsync({
        videoBytes: bytes,
        segments,
        onProgress: setUploadProgress,
        onClipCreated: (n, total) => {
          setClipsCreated(n);
          setTotalClips(total);
        },
      });
      toast.success(
        `Generated ${segments.length} clip${segments.length > 1 ? "s" : ""}!`,
      );
      resetAndClose();
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim() || !linkTitle.trim()) {
      toast.error("Please provide a title and a video URL.");
      return;
    }

    // Multi-clip batch mode
    if (linkDuration && linkDuration > 0 && linkNumClips > 1) {
      const segments: UrlClipSegment[] = [];
      for (let i = 0; i < linkNumClips; i++) {
        const start = i * linkClipLength;
        const end = Math.min((i + 1) * linkClipLength, linkDuration);
        segments.push({
          title: `${linkTitle.trim()} — Part ${i + 1}`,
          caption: linkCaption.trim(),
          aspectRatio: linkAspect,
          partNumber: BigInt(i + 1),
          startTime: start,
          endTime: end,
          url: linkUrl.trim(),
        });
      }
      setLinkTotalClips(segments.length);
      setLinkClipsCreated(0);
      try {
        await addClipFromUrlBatch.mutateAsync({
          segments,
          onClipCreated: (n, total) => {
            setLinkClipsCreated(n);
            setLinkTotalClips(total);
          },
        });
        toast.success(`Generated ${segments.length} clips from link!`);
        resetAndClose();
      } catch {
        toast.error("Failed to generate clips from link.");
      }
      return;
    }

    // Single clip mode
    try {
      await addClipFromUrl.mutateAsync({
        title: linkTitle.trim(),
        caption: linkCaption.trim(),
        aspectRatio: linkAspect,
        url: linkUrl.trim(),
      });
      toast.success("Clip added from link!");
      resetAndClose();
    } catch {
      toast.error("Failed to add clip from link.");
    }
  };

  const AspectOptions = ({
    value,
    onChange,
  }: { value: AspectRatio; onChange: (v: AspectRatio) => void }) => (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as AspectRatio)}
      className="flex flex-wrap gap-4"
    >
      {(
        [
          { val: AspectRatio._9_16, label: "9:16 Shorts" },
          { val: AspectRatio._1_1, label: "1:1 Square" },
          { val: AspectRatio._16_9, label: "16:9 Landscape" },
        ] as const
      ).map(({ val, label }) => (
        <Label
          key={val}
          className="flex items-center gap-2 cursor-pointer font-normal text-sm text-muted-foreground"
        >
          <RadioGroupItem value={val} data-ocid="upload.radio" />
          {label}
        </Label>
      ))}
    </RadioGroup>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      {/* Hidden video element for duration detection */}
      {/* biome-ignore lint/a11y/useMediaCaption: hidden utility element for duration detection */}
      <video ref={hiddenVideoRef} className="hidden" preload="metadata" />

      <DialogContent
        className="bg-popover border-border max-w-lg"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Auto-Split into Shorts
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted">
            <TabsTrigger
              value="file"
              className="flex-1 gap-1.5"
              data-ocid="upload.tab"
            >
              <Upload className="w-3.5 h-3.5" /> Upload & Split
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="flex-1 gap-1.5"
              data-ocid="upload.tab"
            >
              <Link className="w-3.5 h-3.5" /> Paste Link
            </TabsTrigger>
          </TabsList>

          {/* ── File Tab ── */}
          <TabsContent value="file" className="space-y-4 mt-4">
            {/* Step 1: Select file */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <span className="bg-primary text-primary-foreground text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  1
                </span>
                Select Video
              </Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-primary/20 file:text-primary file:px-3 file:py-1 file:rounded-md"
                data-ocid="upload.input"
              />
              <AnimatePresence>
                {videoDuration != null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Film className="w-3.5 h-3.5 text-primary" />
                    <span>
                      Duration:{" "}
                      <strong className="text-foreground">
                        {formatDuration(videoDuration)}
                      </strong>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Configure */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <span className="bg-primary text-primary-foreground text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  2
                </span>
                Configure Clips
              </Label>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Title *
                </Label>
                <Input
                  placeholder="Enter video title..."
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="bg-background border-border"
                  data-ocid="upload.input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Caption (optional)
                </Label>
                <Textarea
                  placeholder="Describe your video..."
                  value={fileCaption}
                  onChange={(e) => setFileCaption(e.target.value)}
                  className="bg-background border-border resize-none"
                  rows={2}
                  data-ocid="upload.textarea"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Clip Length
                </Label>
                <div className="flex gap-2">
                  {CLIP_LENGTHS.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setClipLength(len)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                        clipLength === len
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50"
                      }`}
                      data-ocid="upload.toggle"
                    >
                      {len}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Aspect Ratio
                </Label>
                <AspectOptions value={fileAspect} onChange={setFileAspect} />
              </div>

              {/* Live preview */}
              <AnimatePresence>
                {videoDuration != null && numClips > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Scissors className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-semibold">
                        Will generate
                      </span>
                      <Badge className="bg-primary text-primary-foreground font-black text-base px-2.5">
                        {numClips}
                      </Badge>
                      <span className="text-foreground font-semibold">
                        clip{numClips > 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {clipLength}s each
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 3: Generate */}
            {addClipBatch.isPending && (
              <div className="space-y-2" data-ocid="upload.loading_state">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {clipsCreated < totalClips
                      ? `Creating clip ${clipsCreated + 1} of ${totalClips}...`
                      : "Uploading video..."}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
                {totalClips > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: totalClips }).map((_, i) => (
                      <div
                        key={`bar-${i + 1}`}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < clipsCreated ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={handleFileSubmit}
              disabled={isSubmitting || !file}
              data-ocid="upload.submit_button"
            >
              {addClipBatch.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating{" "}
                  {totalClips > 0 ? `${clipsCreated}/${totalClips}` : ""}{" "}
                  clips...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  {numClips > 1
                    ? `Generate ${numClips} Clips`
                    : "Upload as Clip"}
                </>
              )}
            </Button>
          </TabsContent>

          {/* ── Link Tab ── */}
          <TabsContent value="link" className="space-y-4 mt-4">
            {/* Info note */}
            <div className="rounded-lg bg-muted/40 border border-border px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              Link clips play directly in the browser. Set an estimated duration
              to auto-split into shorts.
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Video URL *</Label>
              <Input
                placeholder="https://youtube.com/watch?v=... or direct .mp4 URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-background border-border"
                data-ocid="upload.input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title *</Label>
              <Input
                placeholder="Enter clip title..."
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="bg-background border-border"
                data-ocid="upload.input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Caption</Label>
              <Textarea
                placeholder="Describe your clip..."
                value={linkCaption}
                onChange={(e) => setLinkCaption(e.target.value)}
                className="bg-background border-border resize-none"
                rows={2}
                data-ocid="upload.textarea"
              />
            </div>

            {/* Auto-split configuration */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-primary" />
                Auto-Split Settings
              </Label>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Estimated Duration (seconds)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 300 for a 5-minute video"
                  value={linkDuration ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLinkDuration(val === "" ? null : Number(val));
                  }}
                  className="bg-background border-border"
                  data-ocid="upload.input"
                />
                {linkDuration != null && linkDuration > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatDuration(linkDuration)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Clip Length
                </Label>
                <div className="flex gap-2">
                  {CLIP_LENGTHS.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLinkClipLength(len)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                        linkClipLength === len
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50"
                      }`}
                      data-ocid="upload.toggle"
                    >
                      {len}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Aspect Ratio
                </Label>
                <AspectOptions value={linkAspect} onChange={setLinkAspect} />
              </div>

              {/* Live preview */}
              <AnimatePresence>
                {linkDuration != null &&
                  linkDuration > 0 &&
                  linkNumClips > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <Scissors className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-semibold">
                          Will generate
                        </span>
                        <Badge className="bg-primary text-primary-foreground font-black text-base px-2.5">
                          {linkNumClips}
                        </Badge>
                        <span className="text-foreground font-semibold">
                          clip{linkNumClips > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {linkClipLength}s each
                      </span>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Progress while generating URL batch */}
            {addClipFromUrlBatch.isPending && (
              <div className="space-y-2" data-ocid="upload.loading_state">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Creating clip {linkClipsCreated + 1} of {linkTotalClips}...
                  </span>
                  <span>
                    {linkTotalClips > 0
                      ? Math.round((linkClipsCreated / linkTotalClips) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    linkTotalClips > 0
                      ? (linkClipsCreated / linkTotalClips) * 100
                      : 0
                  }
                  className="h-1.5"
                />
                {linkTotalClips > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: linkTotalClips }).map((_, i) => (
                      <div
                        key={`lbar-${i + 1}`}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < linkClipsCreated ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={handleLinkSubmit}
              disabled={isSubmitting}
              data-ocid="upload.submit_button"
            >
              {addClipFromUrlBatch.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating{" "}
                  {linkTotalClips > 0
                    ? `${linkClipsCreated}/${linkTotalClips}`
                    : ""}{" "}
                  clips...
                </>
              ) : addClipFromUrl.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  {linkDuration && linkDuration > 0 && linkNumClips > 1
                    ? `Generate ${linkNumClips} Clips`
                    : "Upload as Clip"}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
