// Layout for auth pages (login, signup) — no nav, no auth check needed
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
