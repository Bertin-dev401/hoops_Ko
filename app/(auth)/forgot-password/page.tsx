// Forgot password page — sends a Firebase password reset email to the user
// Shows a success state after sending so the user knows to check their inbox
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Enter your email address."); return; }
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("user-not-found") || msg.includes("invalid-email")) {
        setError("No account found with that email.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-mark">H</div>
          <span style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", textTransform: "uppercase" }}>Hoops</span>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "var(--r-sm)",
              background: "rgba(0, 200, 83, 0.1)", border: "1px solid rgba(0, 200, 83, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CheckIcon />
            </div>
            <h1 className="auth-card__title" style={{ marginBottom: "8px" }}>Check your inbox</h1>
            <p className="auth-card__sub">
              We sent a reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
              Check your spam folder if you don&apos;t see it.
            </p>
            <Link
              href="/login"
              className="btn btn--ghost btn--sm"
              style={{ marginTop: "24px", width: "100%", justifyContent: "center" }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="auth-card__title">Reset password</h1>
              <p className="auth-card__sub">We&apos;ll send a reset link to your email.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && <div className="auth-form__error" role="alert">{error}</div>}

              <div className="field">
                <label className="field__label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="field__input"
                  placeholder="you@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--lg btn--full"
                disabled={loading}
              >
                {loading ? <span className="btn-loading" /> : "Send reset link"}
              </button>
            </form>

            <p className="auth-form__switch">
              Remembered it?{" "}
              <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
