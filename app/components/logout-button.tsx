"use client";

import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import LoadingButton from "@/app/components/ui/loading-button";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/user/logout', {
        method: 'POST',
      });

      if (response.ok) {
        logout();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <LoadingButton
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-foreground"
      loadingMessage="Logging out..."
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </LoadingButton>
  );
} 