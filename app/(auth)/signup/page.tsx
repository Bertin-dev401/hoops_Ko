// Signup page — creates a Firebase Auth account and a Firestore user document
// Validates name, email, and minimum password length before submitting
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) { setError("Fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, name.trim());
      router.replace("/dashboard");
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered.");
      } else if (msg.includes("invalid-email")) {
        setError("Enter a valid email address.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak.");
      } else if (msg.includes("auth/")) {
        setError("Something went wrong. Try again.");
      } else {
        // Account created — redirect to dashboard, verification wall will catch unverified users
        router.replace("/dashboard");
        return;
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
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Hoops</span>
        </div>

        <div>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__sub">Find your crew and run next game.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-form__error" role="alert">{error}</div>}

          <div className="field">
            <label className="field__label" htmlFor="name">Display name</label>
            <input
              id="name"
              type="text"
              className="field__input"
              placeholder="Jordan"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={40}
            />
          </div>

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

          <div className="field">
            <label className="field__label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="field__input"
              placeholder="8+ characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="field__hint">Minimum 8 characters.</span>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            disabled={loading}
          >
            {loading ? <span className="btn-loading" /> : "Create account"}
          </button>
        </form>

        <p className="auth-form__switch">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
