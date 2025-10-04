import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LE Assistance",
  description: "CMU Lifelong Education Assistance Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
