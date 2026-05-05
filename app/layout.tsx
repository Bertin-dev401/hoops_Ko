// Root layout — wraps the entire app with AuthProvider and applies global styles
// Also injects a theme script to prevent flash of wrong theme on load
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Hoops", template: "%s · Hoops" },
  description: "Find players, organize runs.",
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0c0f17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="strict-origin" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e){}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
