import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendor Review",
  description: "Governed software-vendor intake and review",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
