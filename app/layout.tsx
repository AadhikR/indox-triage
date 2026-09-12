import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inbox Triage",
  description: "Know what needs your attention before your inbox decides for you.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
