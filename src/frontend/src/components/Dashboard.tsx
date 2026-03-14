import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clapperboard,
  Film,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteClip, useListMyClips } from "../hooks/useQueries";
import ClipsGrid from "./ClipsGrid";
import UploadDialog from "./UploadDialog";

type DashView = "overview" | "my-clips";

interface Props {
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export default function Dashboard({ onNavigate, isAdmin }: Props) {
  const [view, setView] = useState<DashView>("my-clips");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: clips, isLoading } = useListMyClips();
  const deleteClip = useDeleteClip();
  const { clear, identity } = useInternetIdentity();

  const clipCount = clips?.length ?? 0;
  const estimatedStorageMB = clipCount * 150;

  const handleDelete = async (id: string) => {
    try {
      await deleteClip.mutateAsync(id);
      toast.success("Clip deleted.");
    } catch {
      toast.error("Failed to delete clip.");
    }
  };

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-4)}`
    : null;

  const navItems: {
    view: DashView | null;
    label: string;
    icon: React.ElementType;
    action?: () => void;
  }[] = [
    { view: "overview", label: "Dashboard", icon: LayoutDashboard },
    { view: "my-clips", label: "My Clips", icon: Film },
    {
      view: null,
      label: "Upload",
      icon: Upload,
      action: () => setUploadOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button
            type="button"
            className="flex items-center gap-2"
            onClick={() => onNavigate("landing")}
            data-ocid="sidebar.link"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-black text-base">
              Modern<span className="text-primary">Clips</span>
            </span>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                item.view && view === item.view
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
              onClick={() => {
                if (item.action) item.action();
                else if (item.view) setView(item.view);
              }}
              data-ocid="sidebar.link"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-sidebar-border">
          {isAdmin && (
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              onClick={() => onNavigate("admin")}
              data-ocid="sidebar.link"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </button>
          )}
          {identity && (
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              onClick={() => {
                clear();
                onNavigate("landing");
              }}
              data-ocid="sidebar.link"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header
          className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between"
          data-ocid="dashboard.section"
        >
          <button
            type="button"
            className="md:hidden flex items-center gap-2"
            onClick={() => onNavigate("landing")}
            data-ocid="nav.link"
          >
            <Clapperboard className="h-5 w-5 text-primary" />
            <span className="font-display font-black text-sm">ModernClips</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {shortPrincipal && (
              <Badge
                variant="outline"
                className="border-border text-muted-foreground text-xs hidden sm:flex"
              >
                {shortPrincipal}
              </Badge>
            )}
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              onClick={() => setUploadOpen(true)}
              data-ocid="dashboard.primary_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8">
          {view === "overview" && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div>
                <h1 className="font-display font-black text-3xl text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Overview of your clips and activity.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div
                  className="bg-card border border-border/50 rounded-2xl p-5"
                  data-ocid="dashboard.card"
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">
                    Total Clips
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 shimmer" />
                  ) : (
                    <p className="font-display font-black text-3xl text-foreground">
                      {clipCount}
                    </p>
                  )}
                </div>
                <div
                  className="bg-card border border-border/50 rounded-2xl p-5"
                  data-ocid="dashboard.card"
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">
                    Est. Storage
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 shimmer" />
                  ) : (
                    <p className="font-display font-black text-3xl text-foreground">
                      {estimatedStorageMB < 1000
                        ? `${estimatedStorageMB} MB`
                        : `${(estimatedStorageMB / 1000).toFixed(1)} GB`}
                    </p>
                  )}
                </div>
                <div
                  className="bg-card border border-border/50 rounded-2xl p-5 col-span-2 sm:col-span-1"
                  data-ocid="dashboard.card"
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">
                    Plan
                  </p>
                  <p className="font-display font-black text-3xl text-primary">
                    Free
                  </p>
                </div>
              </div>

              {/* Quick upload CTA */}
              <button
                type="button"
                className="w-full bg-card border border-dashed border-border/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setUploadOpen(true)}
                data-ocid="dashboard.dropzone"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground text-lg mb-1">
                  Upload New Video
                </h3>
                <p className="text-muted-foreground text-sm">
                  Click to select a video file or paste a link
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold">
                  <Plus className="w-3.5 h-3.5" /> New Clip
                </div>
              </button>
            </div>
          )}

          {view === "my-clips" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-black text-3xl text-foreground">
                    My Clips
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {isLoading
                      ? "Loading..."
                      : `${clipCount} clip${clipCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-border text-foreground hover:bg-secondary"
                  onClick={() => setUploadOpen(true)}
                  data-ocid="clips.open_modal_button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Clip
                </Button>
              </div>
              <ClipsGrid
                clips={clips}
                isLoading={isLoading}
                canDelete
                onDelete={handleDelete}
                emptyMessage="You haven't uploaded any clips yet. Click 'New Clip' to get started."
              />
            </div>
          )}
        </main>
      </div>

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
