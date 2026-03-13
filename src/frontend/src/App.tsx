import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Clapperboard, Film, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { VideoClip } from "./backend.d";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import LoginButton from "./components/LoginButton";
import UploadDialog from "./components/UploadDialog";
import VideoCard from "./components/VideoCard";
import VideoPlayerModal from "./components/VideoPlayerModal";
import { useDeleteClip, useIsAdmin, useListClips } from "./hooks/useQueries";

const queryClient = new QueryClient();

const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

function Gallery() {
  const [playingClip, setPlayingClip] = useState<VideoClip | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: clips, isLoading } = useListClips();
  const { data: isAdmin } = useIsAdmin();
  const deleteClip = useDeleteClip();

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClip.mutateAsync(deleteTarget);
      toast.success("Clip deleted.");
    } catch {
      toast.error("Failed to delete clip.");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2.5"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              Clip<span className="text-primary">4K</span>
            </span>
          </a>

          <nav className="flex items-center gap-3">
            {isAdmin && (
              <Button
                onClick={() => setUploadOpen(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex"
                data-ocid="nav.primary_button"
              >
                <Plus className="h-4 w-4" />
                Upload Clip
              </Button>
            )}
            <LoginButton />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-cinema-bg.dim_1920x600.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
              <Film className="h-3 w-3" />
              4K Ultra HD
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-2xl">
              Cinema-grade clips,{" "}
              <span className="text-primary">captioned</span> & ready.
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl leading-relaxed">
              Browse stunning 4K video clips with precision captions. Every
              frame tells a story.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mobile upload button */}
      {isAdmin && (
        <div className="sm:hidden container mx-auto px-4 pt-2 pb-0">
          <Button
            onClick={() => setUploadOpen(true)}
            className="w-full gap-2 bg-primary text-primary-foreground"
            data-ocid="clips.primary_button"
          >
            <Plus className="h-4 w-4" />
            Upload Clip
          </Button>
        </div>
      )}

      {/* Clips grid */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            data-ocid="clips.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="shimmer aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="shimmer h-4 w-3/4" />
                  <Skeleton className="shimmer h-3 w-full" />
                  <Skeleton className="shimmer h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : clips && clips.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">
                  {clips.length}
                </span>{" "}
                {clips.length === 1 ? "clip" : "clips"} available
              </p>
            </div>
            <AnimatePresence mode="popLayout">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                data-ocid="clips.list"
              >
                {clips.map((clip, i) => (
                  <VideoCard
                    key={clip.id}
                    clip={clip}
                    index={i}
                    isAdmin={!!isAdmin}
                    onPlay={setPlayingClip}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                ))}
              </div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="clips.empty_state"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
              <Film className="h-9 w-9 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              No clips yet
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {isAdmin
                ? "Upload your first 4K clip to get started."
                : "Check back soon — clips will appear here."}
            </p>
            {isAdmin && (
              <Button
                onClick={() => setUploadOpen(true)}
                className="mt-6 gap-2 bg-primary text-primary-foreground"
                data-ocid="clips.primary_button"
              >
                <Plus className="h-4 w-4" />
                Upload First Clip
              </Button>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">
              Clip4K
            </span>
          </div>
          <p>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <VideoPlayerModal
        clip={playingClip}
        onClose={() => setPlayingClip(null)}
      />
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Gallery />
    </QueryClientProvider>
  );
}
