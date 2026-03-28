import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vowly Invites",
  description: "Digital wedding invitations for Sri Lanka",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
