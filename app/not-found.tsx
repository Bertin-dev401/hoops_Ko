// Custom 404 page — shown when a user hits a route that doesn't exist
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-card__logo" style={{ justifyContent: "center" }}>
          <div className="auth-card__logo-mark">H</div>
          <span style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", textTransform: "uppercase" }}>Hoops</span>
        </div>
        <div style={{
          fontSize: "3rem", fontWeight: 900, color: "var(--accent)",
          letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px",
        }}>
          404
        </div>
        <h1 className="auth-card__title" style={{ marginBottom: "8px" }}>Page not found</h1>
        <p className="auth-card__sub" style={{ marginBottom: "24px" }}>
          This court doesn&apos;t exist. Head back to the game.
        </p>
        <Link href="/dashboard" className="btn btn--primary btn--full" style={{ justifyContent: "center" }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
