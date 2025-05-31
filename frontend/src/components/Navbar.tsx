"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ตรวจสอบเมื่อ scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // เปลี่ยนค่าตามต้องการ
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* โลโก้ */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-2xl font-bold text-black tracking-wide hover:text-gray-600 transition duration-200">
                MySite
              </span>
            </Link>
          </div>

          {/* เมนูใหญ่ */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="/" text="หน้าแรก" />
            <NavLink href="/about" text="เกี่ยวกับ" />
            <NavLink href="/contact" text="ติดต่อ" />
          </div>

          {/* ปุ่มเมนูมือถือ */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* เมนูมือถือ */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pt-4 pb-6 shadow-md rounded-b-xl space-y-3">
          <MobileLink href="/" text="หน้าแรก" />
          <MobileLink href="/about" text="เกี่ยวกับ" />
          <MobileLink href="/contact" text="ติดต่อ" />
        </div>
      )}
    </nav>
  );
}

const NavLink = ({ href, text }: { href: string; text: string }) => (
  <Link
    href={href}
    className="text-black font-medium hover:text-blue-500 transition duration-200"
  >
    {text}
  </Link>
);

const MobileLink = ({ href, text }: { href: string; text: string }) => (
  <Link
    href={href}
    className="block text-gray-800 font-medium hover:text-indigo-600 transition duration-200"
  >
    {text}
  </Link>
);
