import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import { PwaRegister } from "@/components/pwa-register";
export const metadata: Metadata = {
  title: "KHANIVERSITY — Learn. Build. Innovate. Master.",
  description:
    "A focused start to computer science. Structured lessons, practical thinking and a path to demonstrated mastery.",
  applicationName: "KHANIVERSITY",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "KHANIVERSITY", statusBarStyle: "black-translucent" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
