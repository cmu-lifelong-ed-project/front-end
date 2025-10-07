import React from "react";
import Navbar from "@/components/Navbar";
import "../globals.css"; // ใช้ global style ของคุณ

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid-main">
      {/* Navbar เหมือนหน้า main */}
      <Navbar />

      {/* กันพื้นที่ด้านบนถ้า Navbar เป็น fixed */}
      <main className="grid-content pt-16 md:pt-20">{children}</main>
    </div>
  );
}
