import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Clapperboard, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import LoginButton from "./components/LoginButton";
import ShortsFeed from "./components/ShortsFeed";
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

  return (
    <div className="bg-black min-h-screen">
      {/* Sticky header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-none">
        <a
          href="/"
          className="flex items-center gap-2 pointer-events-auto"
          data-ocid="nav.link"
        >
          <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Clapperboard className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-display font-black text-base tracking-tight text-white">
            Clip<span className="text-primary">4K</span>
          </span>
        </a>

        <nav className="flex items-center gap-2 pointer-events-auto">
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setUploadOpen(true)}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs h-8"
              data-ocid="nav.primary_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload
            </Button>
          )}
          <LoginButton />
        </nav>
      </header>

      {/* Shorts feed — this IS the UI */}
      <main>
        <ShortsFeed
          clips={clips}
          isLoading={isLoading}
          isAdmin={!!isAdmin}
          onDelete={(id) => setDeleteTarget(id)}
          onUpload={() => setUploadOpen(true)}
        />
      </main>

      {/* Dialogs */}
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
