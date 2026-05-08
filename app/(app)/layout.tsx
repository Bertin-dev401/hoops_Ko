// Protected layout for all app pages (dashboard, communities, sessions, profile)
// Redirects to /login if not authenticated, shows verification screen if email not verified
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, resendVerification } = useAuth();
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

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

  // Block access until email is verified
  if (!user.emailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await resendVerification();
        setResent(true);
      } catch {}
      finally { setResending(false); }
    };

    const handleLogout = async () => {
      await logout();
      router.replace("/login");
    };

    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__logo">
            <div className="auth-card__logo-mark">H</div>
            <span style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", textTransform: "uppercase" }}>Hoops</span>
          </div>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "var(--r-sm)",
              background: "var(--accent-muted)", border: "1px solid rgba(255,107,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <MailIcon />
            </div>
            <h1 className="auth-card__title" style={{ marginBottom: "8px" }}>Verify your email</h1>
            <p className="auth-card__sub" style={{ marginBottom: "24px" }}>
              We sent a verification link to{" "}
              <strong style={{ color: "var(--text)" }}>{user.email}</strong>.
              Click it to activate your account.
            </p>
            {resent && (
              <div className="auth-form__error" style={{
                background: "rgba(0,200,83,0.08)", borderColor: "rgba(0,200,83,0.2)",
                borderLeftColor: "var(--success)", color: "var(--success)", marginBottom: "16px",
              }}>
                Verification email resent. Check your inbox.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                className="btn btn--primary btn--full"
                onClick={handleResend}
                disabled={resending || resent}
              >
                {resending ? <span className="btn-loading" /> : resent ? "Email sent" : "Resend verification email"}
              </button>
              <button className="btn btn--ghost btn--full" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      <Nav />
      <main className="main-content">{children}</main>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="var(--accent)" strokeWidth="1.4" />
      <path d="M1 5l7 5 7-5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
