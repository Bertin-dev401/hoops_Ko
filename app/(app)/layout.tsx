// Protected layout for all app pages (dashboard, communities, sessions, profile)
// Redirects to /login if not authenticated
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center",
        justifyContent: "center", color: "var(--text-3)", fontSize: "0.875rem",
      }}>
        Loading
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page-root">
      <Nav />
      <main className="main-content">{children}</main>
    </div>
  );
}
