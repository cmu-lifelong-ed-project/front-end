"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// ===== Types & Config =====
type RoleKey = "super_admin" | "admin"; // 👈 ใช้เฉพาะแอดมินเท่านั้น

const ROLE_ITEMS: Record<RoleKey, string[]> = {
  super_admin: ["แก้ไขการตั้งค่าเว็บไซต์", "การจัดการสมาชิกบัญชี", "ข้อมูลเชิงลึก"],
  admin: ["แก้ไขการตั้งค่าเว็บไซต์", "ข้อมูลเชิงลึก"],
};

const ROLE_LABEL: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

const ROLE_HEADING: Record<RoleKey, string> = {
  super_admin: "ซูเปอร์แอดมิน",
  admin: "แอดมิน",
};

type UserRow = {
  name?: string;
  email: string;
  role: RoleKey;
  createdAt: string; // ISO
  avatarUrl?: string;
};

// helpers
const norm = (s: string) => s.trim().toLowerCase();
const isValidEmail = (value: string) => /^[^\s@]+@cmu\.ac\.th$/i.test(value.trim());

export default function AddUserPage() {
  const [role, setRole] = useState<RoleKey>("admin"); // 👈 ค่าเริ่มต้นเป็น admin
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  // อ่าน role ของผู้ใช้ที่ล็อกอินปัจจุบัน (dev/test)
  const [currentRole, setCurrentRole] = useState<RoleKey | undefined>(undefined);
  useEffect(() => {
    try {
      const r = localStorage.getItem("current_role") as RoleKey | null;
      setCurrentRole(r ?? undefined);
    } catch {}
  }, []);
  const isSuperAdmin = currentRole === "super_admin";

  // ถ้ามี query ?email= → โหมดแก้ไข
  useEffect(() => {
    const preset = params.get("email");
    if (preset && typeof preset === "string") {
      setEmail(preset);
      try {
        const users: UserRow[] = JSON.parse(localStorage.getItem("users") || "[]");
        const found = users.find((u) => norm(u.email) === norm(preset));
        if (found) {
          setRole(found.role);
          setEditMode(true);
        } else {
          setEditMode(false);
        }
      } catch {
        setEditMode(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const value = email.trim();

    if (!value) {
      setError("กรุณากรอกอีเมล CMU");
      return;
    }
    if (!editMode && !isValidEmail(value)) {
      setError("อีเมลต้องเป็นโดเมน @cmu.ac.th เท่านั้น");
      return;
    }

    // guard: ห้ามผู้ที่ไม่ใช่ super admin ตั้งคนอื่นเป็น super_admin
    if (!isSuperAdmin && role === "super_admin") {
      setError("ต้องเป็น Super Admin เท่านั้นจึงจะตั้งสิทธิ์ Super Admin ได้");
      return;
    }

    let users: UserRow[] = [];
    try {
      const raw = localStorage.getItem("users");
      if (raw) users = JSON.parse(raw) as UserRow[];
    } catch {
      users = [];
    }

    const idx = users.findIndex((u) => norm(u.email) === norm(value));

    // เช็คจำนวน super admin ปัจจุบัน (กัน demote คนสุดท้าย)
    const superAdmins = users.filter((u) => u.role === "super_admin");

    if (editMode) {
      if (idx >= 0) {
        const prev = users[idx];
        if (
          prev.role === "super_admin" &&
          role !== "super_admin" &&
          superAdmins.length === 1
        ) {
          setError("ไม่สามารถลดสิทธิ์ Super Admin คนสุดท้ายได้");
          return;
        }
        users[idx] = { ...users[idx], role };
      } else {
        if (!isValidEmail(value)) {
          setError("อีเมลต้องเป็นโดเมน @cmu.ac.th เท่านั้น");
          return;
        }
        users.push({
          email: value,
          role,
          createdAt: new Date().toISOString(),
          name: value.split("@")[0],
        });
      }
    } else {
      if (idx >= 0) {
        setError("อีเมลนี้ถูกเพิ่มไว้แล้ว");
        return;
      }
      const nameFromEmail = value.split("@")[0];
      users.push({
        email: value,
        role,
        createdAt: new Date().toISOString(),
        name: nameFromEmail,
      });
    }

    localStorage.setItem("users", JSON.stringify(users));
    router.push("/setting");
  };

  const canSave =
    editMode ? email.trim().length > 0 : email.trim().length > 0 && isValidEmail(email);

  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai']">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] sm:p-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 sm:mb-6"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ย้อนกลับ</span>
          </button>

          <h1 className="mb-4 text-base font-semibold text-gray-700 sm:mb-6 sm:text-lg">
            {editMode ? "แก้ไขสิทธิ์แอดมิน" : "การจัดการแอดมิน"}
          </h1>

          <div className="rounded-3xl border border-gray-100 bg-[#F8F7FF] p-4 sm:p-6">
            {/* ประเภทสิทธิ์ */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ประเภทสิทธิ์
              </label>
              <div className="relative inline-block w-full sm:w-auto">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleKey)}
                  className="w-full appearance-none rounded-full border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:border-[#6C63FF] focus:outline-none"
                >
                  {(["admin", "super_admin"] as RoleKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ROLE_LABEL[k]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              {!isSuperAdmin && role === "super_admin" && (
                <p className="mt-2 text-xs text-red-600">
                  ต้องเป็น Super Admin เท่านั้นจึงจะตั้งสิทธิ์ Super Admin ได้
                </p>
              )}
            </div>

            {/* สิทธิ์ที่ได้รับ */}
            <div className="mb-8">
              <div className="mb-2 text-sm font-medium text-gray-700">
                {ROLE_HEADING[role]}
              </div>
              <div className="space-y-3 pl-0 sm:pl-6">
                {ROLE_ITEMS[role].includes("แก้ไขการตั้งค่าเว็บไซต์") && (
                  <PermissionRow text="แก้ไขการตั้งค่าเว็บไซต์" />
                )}
                {ROLE_ITEMS[role].includes("การจัดการสมาชิกบัญชี") && (
                  <PermissionRow text="การจัดการสมาชิกบัญชี" />
                )}
                {ROLE_ITEMS[role].includes("ข้อมูลเชิงลึก") && (
                  <PermissionRow text="ข้อมูลเชิงลึก" />
                )}
              </div>
            </div>

            {/* อีเมล (CMU เท่านั้น) */}
            <div className="mt-2">
              <div className="mb-2 text-sm font-medium text-gray-700">
                อีเมล CMU Account
              </div>
              <div className="relative max-w-none sm:max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="example@cmu.ac.th"
                  disabled={editMode}
                  className={`w-full rounded-full border bg-white px-5 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#6C63FF] focus:outline-none ${
                    editMode ? "border-gray-200 text-gray-500" : "border-gray-300"
                  }`}
                />
              </div>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-stretch sm:mt-8 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || (!isSuperAdmin && role === "super_admin")}
              className="w-full rounded-full bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 active:scale-[.99] disabled:opacity-40 sm:w-auto"
            >
              {editMode ? "บันทึกการเปลี่ยนแปลง" : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function PermissionRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm leading-tight text-gray-600">
      <span className="min-w-0 truncate">{text}</span>
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}
