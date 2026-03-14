import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Clapperboard, Film, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Page } from "../App";
import { UserRole } from "../backend";
import {
  useDeleteClip,
  useDemoteFromAdmin,
  useGetAdminStats,
  useListAllUsers,
  useListClips,
  usePromoteToAdmin,
} from "../hooks/useQueries";
import ClipsGrid from "./ClipsGrid";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4"];

interface Props {
  onNavigate: (page: Page) => void;
}

export default function AdminPanel({ onNavigate }: Props) {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: users, isLoading: usersLoading } = useListAllUsers();
  const { data: clips, isLoading: clipsLoading } = useListClips();

  const promoteToAdmin = usePromoteToAdmin();
  const demoteFromAdmin = useDemoteFromAdmin();
  const deleteClip = useDeleteClip();

  const handlePromote = async (principal: Principal) => {
    try {
      await promoteToAdmin.mutateAsync(principal);
      toast.success("User promoted to admin.");
    } catch {
      toast.error("Failed to promote user.");
    }
  };

  const handleDemote = async (principal: Principal) => {
    try {
      await demoteFromAdmin.mutateAsync(principal);
      toast.success("User demoted.");
    } catch {
      toast.error("Failed to demote user.");
    }
  };

  const handleDeleteClip = async (id: string) => {
    try {
      await deleteClip.mutateAsync(id);
      toast.success("Clip deleted.");
    } catch {
      toast.error("Failed to delete clip.");
    }
  };

  const truncate = (p: Principal) => {
    const s = p.toString();
    return `${s.slice(0, 8)}...${s.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
        data-ocid="admin.section"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => onNavigate("dashboard")}
            data-ocid="admin.secondary_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <Clapperboard className="h-5 w-5 text-primary" />
            <span className="font-display font-black text-lg">
              Modern<span className="text-primary">Clips</span>
              <span className="text-muted-foreground font-normal text-base ml-2">
                / Admin
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: statsLoading ? null : String(stats?.userCount ?? 0),
              icon: Users,
            },
            {
              label: "Total Clips",
              value: statsLoading ? null : String(stats?.clipCount ?? 0),
              icon: Film,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border/50 rounded-2xl p-5"
              data-ocid="admin.card"
            >
              <div className="flex items-center gap-2 mb-3">
                <s.icon className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-xs uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
              {s.value === null ? (
                <Skeleton className="h-8 w-16 shimmer" />
              ) : (
                <p className="font-display font-black text-3xl text-foreground">
                  {s.value}
                </p>
              )}
            </div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="bg-muted">
            <TabsTrigger value="users" data-ocid="admin.tab">
              Users
            </TabsTrigger>
            <TabsTrigger value="clips" data-ocid="admin.tab">
              All Clips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              {usersLoading ? (
                <div className="p-8 space-y-3" data-ocid="admin.loading_state">
                  {SKELETON_KEYS.map((k) => (
                    <Skeleton key={k} className="h-10 w-full shimmer" />
                  ))}
                </div>
              ) : !users?.length ? (
                <div className="p-12 text-center" data-ocid="admin.empty_state">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No users found.
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Principal
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(([principal, role], i) => (
                      <TableRow
                        key={principal.toString()}
                        className="border-border/30 hover:bg-secondary/30"
                        data-ocid={`admin.row.${i + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {truncate(principal)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              role === UserRole.admin
                                ? "border-primary/40 text-primary bg-primary/10"
                                : role === UserRole.user
                                  ? "border-accent/40 text-accent bg-accent/10"
                                  : "border-border text-muted-foreground"
                            }
                          >
                            {role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {role !== UserRole.admin ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-border hover:bg-secondary"
                                onClick={() => handlePromote(principal)}
                                disabled={promoteToAdmin.isPending}
                                data-ocid={`admin.edit_button.${i + 1}`}
                              >
                                {promoteToAdmin.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Promote"
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDemote(principal)}
                                disabled={demoteFromAdmin.isPending}
                                data-ocid={`admin.delete_button.${i + 1}`}
                              >
                                {demoteFromAdmin.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Demote"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="clips" className="mt-6">
            <ClipsGrid
              clips={clips}
              isLoading={clipsLoading}
              canDelete
              onDelete={handleDeleteClip}
              emptyMessage="No clips have been uploaded yet."
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
