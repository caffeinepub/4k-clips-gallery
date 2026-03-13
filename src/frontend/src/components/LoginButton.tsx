import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? "outline" : "default"}
      className={`gap-2 font-body ${
        isAuthenticated
          ? "border-border text-muted-foreground hover:text-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
      data-ocid="nav.toggle"
    >
      {isLoggingIn ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAuthenticated ? (
        <LogOut className="h-4 w-4" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      {isLoggingIn ? "Signing in…" : isAuthenticated ? "Sign Out" : "Sign In"}
    </Button>
  );
}
