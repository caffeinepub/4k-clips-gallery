import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";

const queryClient = new QueryClient();

export type Page = "landing" | "dashboard" | "admin";

function AppInner() {
  const [page, setPage] = useState<Page>("landing");
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  const navigate = (p: Page) => setPage(p);

  if (page === "dashboard") {
    return <Dashboard onNavigate={navigate} isAdmin={!!isAdmin} />;
  }

  if (page === "admin" && isAdmin) {
    return <AdminPanel onNavigate={navigate} />;
  }

  return (
    <LandingPage
      onNavigate={navigate}
      isAdmin={!!isAdmin}
      isLoggedIn={!!identity}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
