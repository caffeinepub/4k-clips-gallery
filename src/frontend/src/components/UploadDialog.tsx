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
import { Link, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AspectRatio } from "../backend";
import { useAddClip, useAddClipFromUrl } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadDialog({ open, onClose }: Props) {
  const [tab, setTab] = useState("file");

  // File tab state
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileCaption, setFileCaption] = useState("");
  const [fileAspect, setFileAspect] = useState<AspectRatio>(AspectRatio._9_16);
  const [filePartNum, setFilePartNum] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Link tab state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkCaption, setLinkCaption] = useState("");
  const [linkAspect, setLinkAspect] = useState<AspectRatio>(AspectRatio._9_16);
  const [linkPartNum, setLinkPartNum] = useState("");

  const addClip = useAddClip();
  const addClipFromUrl = useAddClipFromUrl();

  const isSubmitting = addClip.isPending || addClipFromUrl.isPending;

  const resetAndClose = () => {
    setFile(null);
    setFileTitle("");
    setFileCaption("");
    setFileAspect(AspectRatio._9_16);
    setFilePartNum("");
    setUploadProgress(0);
    setLinkUrl("");
    setLinkTitle("");
    setLinkCaption("");
    setLinkAspect(AspectRatio._9_16);
    setLinkPartNum("");
    onClose();
  };

  const handleFileSubmit = async () => {
    if (!file || !fileTitle.trim()) {
      toast.error("Please provide a title and select a video file.");
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const partNumber = filePartNum ? BigInt(filePartNum) : undefined;
      await addClip.mutateAsync({
        title: fileTitle.trim(),
        caption: fileCaption.trim(),
        aspectRatio: fileAspect,
        partNumber,
        videoBytes: bytes,
        onProgress: setUploadProgress,
      });
      toast.success("Clip uploaded successfully!");
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
    try {
      const partNumber = linkPartNum ? BigInt(linkPartNum) : undefined;
      await addClipFromUrl.mutateAsync({
        title: linkTitle.trim(),
        caption: linkCaption.trim(),
        aspectRatio: linkAspect,
        partNumber,
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
      className="flex gap-4"
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
      <DialogContent
        className="bg-popover border-border max-w-lg"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">
            Add New Clip
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted">
            <TabsTrigger
              value="file"
              className="flex-1 gap-1.5"
              data-ocid="upload.tab"
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="flex-1 gap-1.5"
              data-ocid="upload.tab"
            >
              <Link className="w-3.5 h-3.5" /> Paste Link
            </TabsTrigger>
          </TabsList>

          {/* File Tab */}
          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Video File</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-primary/20 file:text-primary file:px-3 file:py-1 file:rounded-md"
                data-ocid="upload.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title *</Label>
              <Input
                placeholder="Enter clip title..."
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                className="bg-background border-border"
                data-ocid="upload.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Caption</Label>
              <Textarea
                placeholder="Describe your clip..."
                value={fileCaption}
                onChange={(e) => setFileCaption(e.target.value)}
                className="bg-background border-border resize-none"
                rows={3}
                data-ocid="upload.textarea"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Aspect Ratio</Label>
              <AspectOptions value={fileAspect} onChange={setFileAspect} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Part Number (optional)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 1"
                value={filePartNum}
                onChange={(e) => setFilePartNum(e.target.value)}
                className="bg-background border-border w-24"
                data-ocid="upload.input"
              />
            </div>
            {addClip.isPending && (
              <div className="space-y-1" data-ocid="upload.loading_state">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={handleFileSubmit}
              disabled={isSubmitting}
              data-ocid="upload.submit_button"
            >
              {addClip.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Upload Clip
                </>
              )}
            </Button>
          </TabsContent>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-4">
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
                rows={3}
                data-ocid="upload.textarea"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Aspect Ratio</Label>
              <AspectOptions value={linkAspect} onChange={setLinkAspect} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Part Number (optional)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 1"
                value={linkPartNum}
                onChange={(e) => setLinkPartNum(e.target.value)}
                className="bg-background border-border w-24"
                data-ocid="upload.input"
              />
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={handleLinkSubmit}
              disabled={isSubmitting}
              data-ocid="upload.submit_button"
            >
              {addClipFromUrl.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" /> Add Clip from Link
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
