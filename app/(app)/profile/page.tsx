// Profile page — displays the logged-in user's name and email (read-only)
// Sign out button clears auth state and redirects to login
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const displayName = user?.displayName ?? "Player";
  const email = user?.email ?? "";

  return (
    <div className="container--narrow" style={{ paddingTop: "0", paddingBottom: "60px" }}>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-header__title">Profile</h1>
          <p className="page-header__sub">Your account.</p>
        </div>
      </div>

      {/* Avatar + name */}
      <div
        className="animate-in stagger-1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          padding: "24px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "var(--accent-muted)",
            border: "2px solid var(--accent-ring)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "var(--accent)",
            flexShrink: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {initials(displayName)}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.025em" }}>
            {displayName}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-2)", marginTop: "2px" }}>
            {email}
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div
        className="animate-in stagger-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <InfoRow label="Display name" value={displayName} />
        <InfoRow label="Email" value={email} last />
      </div>

      {/* Danger zone */}
      <div className="animate-in stagger-3">
        <p className="section-label">Account</p>
        <button
          className="btn btn--danger btn--sm"
          onClick={handleLogout}
          style={{ width: "100%", justifyContent: "center" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: "0.8125rem", color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
