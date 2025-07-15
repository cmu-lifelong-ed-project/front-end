'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/whoAmI");
        const data = await res.json();
        if (data.ok && data.cmuBasicInfo.length > 0) {
          const user = data.cmuBasicInfo[0];
          setFullName(user.firstname_EN + " " + user.lastname_EN);
        } else {
          setFullName("");
        }
      } catch (error) {
        setFullName("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    fetchUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/signOut", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        // รีไดเรกต์ไปหน้า login หรือหน้าอื่น ๆ ตามต้องการ
        router.push("/");
      } else {
        alert("Sign out failed");
      }
    } catch (error) {
      alert("Error signing out");
    }
  };

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
            <Link href="/main">
              <span className="text-2xl font-bold text-black tracking-wide hover:text-gray-600 transition duration-200">
                LifeLong
              </span>
            </Link>
          </div>

          {/* Desktop: ชื่อผู้ใช้ + ปุ่ม Sign out */}
          <div className="hidden md:flex space-x-4 items-center">
            {fullName && (
              <>
                <span className="text-black font-medium">
                   {fullName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile: ชื่อผู้ใช้ + ปุ่มเมนู + ปุ่ม Sign out ในเมนูมือถือ */}
          <div className="md:hidden flex items-center space-x-3">
            {fullName && (
              <span className="text-black font-medium text-sm">
                {fullName}
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-gray-600 focus:outline-none"
              aria-label="Toggle menu"
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

      {/* เมนูมือถือ + ปุ่ม Sign out */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pt-4 pb-6 shadow-md rounded-b-xl space-y-3">
          <MobileLink href="/" text="หน้าแรก" />
          <MobileLink href="/about" text="เกี่ยวกับ" />
          <MobileLink href="/contact" text="ติดต่อ" />
          {fullName && (
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 mt-3 bg-red-600 text-white rounded hover:bg-red-100 transition"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
            </button>
          )}
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
