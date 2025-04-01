'use client'
import { ReactNode, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!userId) {
        router.push('/login');
      } else if (role === 'admin') {
        router.push('/admin');
      }
    }
  }, [userId, role, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-lg">
      <Sidebar />
      <div className="lg:ml-72 transition-all duration-300">
        <Header />
        <main className="p-6 lg:p-8 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}