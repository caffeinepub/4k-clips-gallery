import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Clapperboard, Film, Play, Plus, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import ClipsGrid from "./components/ClipsGrid";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import LoginButton from "./components/LoginButton";
import UploadDialog from "./components/UploadDialog";
import { useDeleteClip, useIsAdmin, useListClips } from "./hooks/useQueries";

const queryClient = new QueryClient();

function Gallery() {
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

  const clipCount = clips?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Nav ── */}
      <header
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md"
        data-ocid="nav.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2.5"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-black text-lg tracking-tight text-foreground">
              Clip<span className="text-primary">4K</span>
            </span>
          </a>

          <nav className="flex items-center gap-3">
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setUploadOpen(true)}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm"
                data-ocid="nav.primary_button"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Clip
              </Button>
            )}
            <LoginButton />
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6"
          data-ocid="hero.section"
        >
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10"
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.72 0.28 25) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                <Sparkles className="w-3 h-3" />
                4K Short-Form Clips
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-tight mb-6">
                Watch&nbsp;&amp;&nbsp;Share
                <br />
                <span className="text-primary">4K Shorts</span>
              </h1>

              <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
                The best vertical short-form clips in crystal-clear 4K. Browse,
                watch, and upload your own.
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-12 px-8"
                  onClick={() => {
                    document
                      .getElementById("clips-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  data-ocid="hero.primary_button"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Browse Clips
                </Button>
                {isAdmin && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-border text-foreground hover:bg-secondary font-semibold text-base h-12 px-8"
                    onClick={() => setUploadOpen(true)}
                    data-ocid="hero.secondary_button"
                  >
                    <Plus className="w-4 h-4" />
                    Upload Clip
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="mt-12 flex items-center justify-center gap-8 sm:gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="text-center">
                <p className="font-display font-black text-2xl text-foreground">
                  {clipCount}
                </p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
                  Clips
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-display font-black text-2xl text-foreground">
                  4K
                </p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
                  Quality
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-display font-black text-2xl text-foreground">
                  Free
                </p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
                  Always
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Feature Highlights ── */}
        <section className="border-y border-border/50 py-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Film,
                title: "Crystal 4K",
                desc: "Every clip streams in ultra-high definition.",
              },
              {
                icon: Sparkles,
                title: "Auto Captions",
                desc: "Captions auto-generated for every short.",
              },
              {
                icon: Zap,
                title: "Instant Upload",
                desc: "Paste a YouTube link or upload your own clip.",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <f.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base mb-1">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Clips Grid ── */}
        <section id="clips-section" className="px-4 sm:px-6 py-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground">
                Latest Clips
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadOpen(true)}
                  className="gap-1.5 border-border text-foreground hover:bg-secondary"
                  data-ocid="clips.open_modal_button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Clip
                </Button>
              )}
            </div>

            <ClipsGrid
              clips={clips}
              isLoading={isLoading}
              isAdmin={!!isAdmin}
              onDelete={(id) => setDeleteTarget(id)}
              onUpload={() => setUploadOpen(true)}
            />
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display font-black text-base text-foreground">
              Clip<span className="text-primary">4K</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* ── Dialogs ── */}
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toaster richColors position="top-center" />
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
