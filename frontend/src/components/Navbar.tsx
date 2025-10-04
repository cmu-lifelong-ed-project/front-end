"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Noto_Sans_Thai } from "next/font/google";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [fullName, setFullName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/whoAmI");
        const data = await res.json();
        if (
          data.ok &&
          Array.isArray(data.cmuBasicInfo) &&
          data.cmuBasicInfo.length > 0
        ) {
          const u = data.cmuBasicInfo[0];
          setFullName(`${u.firstname_EN} ${u.lastname_EN}`);
        } else {
          setFullName("");
        }
      } catch {
        setFullName("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    fetchUser();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ปิด modal ด้วย Esc
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLogoutModal(false);
    };
    if (showLogoutModal) {
      cancelBtnRef.current?.focus();
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showLogoutModal]);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/signOut", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        router.push("/");
      } else {
        alert("Sign out failed");
      }
    } catch {
      alert("Error signing out");
    }
  };

  return (
    <nav

      className={`${notoSansThai.className} fixed top-0 left-0 w-full z-50 
                  transition-all duration-300 
                  ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-white"} 
                  py-1`}

    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* โลโก้ */}
          <div className="flex-shrink-0">
            <Link href="/main" aria-label="ไปหน้าแรก">
              <Image
                src="/logo_le.png"
                alt="LifeLong Logo"
                width={120}
                height={40}
                className="h-10 w-auto hover:opacity-80 transition duration-200"
                priority
              />
            </Link>
          </div>

          {/* Desktop: ชื่อ + ตั้งค่า + ออก */}
          <div className="hidden md:flex items-center gap-2">
            {fullName && (
              <>
                <div className="px-4 py-1 rounded-full border border-purple-300 bg-purple-50 
                                text-[#1E293B] shadow-sm min-w-[150px] text-center 
                                text-[15px] font-normal">
                  {fullName}
                </div>

                {/* ตั้งค่า */}
                <Link
                  href="/setting"
                  aria-label="ตั้งค่า"
                  className="p-1 rounded-lg hover:bg-gray-100 active:scale-95 transition flex items-center justify-center"
                  title="ตั้งค่า"
                >
                  <Image src="/navbar/settings.png" alt="settings" width={21} height={21} />
                </Link>

                {/* ออกจากระบบ */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  aria-label="ออกจากระบบ"
                  title="ออกจากระบบ"
                  className="p-1 rounded-lg hover:bg-gray-100 active:scale-95 transition flex items-center justify-center"
                >
                  <Image src="/navbar/exit.png" alt="logout" width={20} height={20} />
                </button>
              </>
            )}
          </div>

          {/* Mobile: Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-gray-600 focus:outline-none"
              aria-label="สลับเมนู"
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pt-4 pb-6 shadow-md rounded-b-xl space-y-4">
          {fullName && (
            <div className="flex items-center justify-between">
              <div className="px-4 py-1 rounded-full border border-purple-300 bg-purple-50 
                              text-[#1E293B] shadow-sm text-[14px] font-normal min-w-[120px] text-center">
                {fullName}
              </div>

              <div className="flex items-center gap-1">
                {/* ตั้งค่า */}
                <Link
                  href="/setting"
                  aria-label="ตั้งค่า"
                  className="p-1 rounded-lg hover:bg-gray-100 active:scale-95 transition flex items-center justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Image src="/navbar/settings.png" alt="settings" width={20} height={20} />
                </Link>

                {/* ออกจากระบบ */}
                <button
                  onClick={() => { setIsOpen(false); setShowLogoutModal(true); }}
                  aria-label="ออกจากระบบ"
                  className="p-1 rounded-lg hover:bg-gray-100 active:scale-95 transition flex items-center justify-center"
                >
                  <Image src="/navbar/exit.png" alt="logout" width={19} height={19} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Logout */}
      {showLogoutModal && (
        <>
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[1000]"
            onClick={() => setShowLogoutModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       bg-white rounded-2xl shadow-xl w-[90%] max-w-[420px] p-6"
          >

            <h4 id="logout-title" className="text-center font-bold text-[20px] mb-2 text-purple-700">
              ออกจากระบบ
            </h4>
            <p className="text-center text-gray-700 mb-6">
              คุณต้องการออกจากระบบใช่หรือไม่?

            </p>
            <div className="flex justify-center gap-3 sm:gap-4">
              <button
                ref={cancelBtnRef}
                onClick={() => setShowLogoutModal(false)}
                className="px-5 sm:px-6 py-2 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSignOut}
                className="px-5 sm:px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
