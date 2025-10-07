import React from "react";
import Navbar from "@/components/Navbar";
import "./style.css";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid-main">
      <Navbar />
      <main className="grid-content">{children}</main>
    </div>
  );
}
