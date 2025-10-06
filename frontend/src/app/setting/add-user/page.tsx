"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookie";
import { RoleKey, ROLE_ITEMS, ROLE_LABEL, ROLE_HEADING } from "@/lib/role";

const isValidEmail = (value: string) =>
  /^[^\s@]+@cmu\.ac\.th$/i.test(value.trim());

export default function AddUserPage() {
  const [role, setRole] = useState<RoleKey>("admin");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);

  // NEW: สถานะแสดงผลสำเร็จ + กำลังบันทึก
  const [showSuccess, setShowSuccess] = useState(false); // NEW
  const [saving, setSaving] = useState(false); // NEW

  const router = useRouter();

  // อ่าน token จาก cookie
  useEffect(() => {
    const t = getCookie("backend-api-token");
    if (t) setToken(t);
  }, []);

  const handleSave = async () => {
    const value = email.trim();

    if (!value) {
      setError("กรุณากรอกอีเมล CMU");
      return;
    }
    if (!isValidEmail(value)) {
      setError("อีเมลต้องเป็นโดเมน @cmu.ac.th เท่านั้น");
      return;
    }
    if (!token) {
      alert("ไม่พบ token");
      return;
    }

    try {
      setSaving(true); // NEW

      // ส่ง POST แบบไม่ encode @
      const res = await fetch(
        `http://localhost:8080/api/user/${value}/${role}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organization_name_th: organization }),
        }
      );

      if (!res.ok) throw new Error("เพิ่มผู้ใช้ไม่สำเร็จ");

      // NEW: แสดงการบันทึกสำเร็จ แล้วค่อยเปลี่ยนหน้า
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 1200));
      router.push("/setting"); // กลับไปหน้ารายชื่อผู้ใช้
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึกผู้ใช้");
    } finally {
      setSaving(false); // NEW
    }
  };

  const canSave = email.trim().length > 0 && isValidEmail(email);

  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai']">
      {/* NEW: Success Modal */}
      {showSuccess && <SuccessModal />} {/* NEW */}

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl bg-white p-4 shadow sm:p-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ย้อนกลับ</span>
          </button>

          <h1 className="mb-4 text-base font-semibold text-gray-700 sm:text-lg">
            เพิ่มผู้ใช้ใหม่
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
                  {(["admin", "staff", "LE", "officer"] as RoleKey[]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {ROLE_LABEL[k]}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* สิทธิ์ที่ได้รับ */}
            <div className="mb-8">
              <div className="mb-2 text-sm font-medium text-gray-700">
                {ROLE_HEADING[role]}
              </div>
              <div className="space-y-3 pl-0 sm:pl-6">
                {ROLE_ITEMS[role].map((perm) => (
                  <PermissionRow key={perm} text={perm} />
                ))}
              </div>
            </div>

            {/* อีเมล */}
            <div className="mt-2">
              <div className="mb-2 text-sm font-medium text-gray-700">
                อีเมล CMU Account
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="example@cmu.ac.th"
                className="w-full rounded-full border bg-white px-5 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#6C63FF] focus:outline-none border-gray-300"
              />
            </div>

            {/* คณะ/หน่วยงาน */}
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-gray-700">
                คณะ / หน่วยงาน
              </div>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="คณะ / หน่วยงาน"
                className="w-full rounded-full border bg-white px-5 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#6C63FF] focus:outline-none border-gray-300"
              />
            </div>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>

          <div className="mt-6 flex flex-col items-stretch sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving} /* NEW */
              className="w-full rounded-full bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 active:scale-[.99] disabled:opacity-40 sm:w-auto"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล" /* NEW */}
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

/* NEW: ส่วนแสดงผลสำเร็จแบบ UX/UI สะอาดตา */
function SuccessModal() {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-live="polite"
      aria-modal="true"
      role="dialog"
    >
      {/* dim background */}
      <div className="absolute inset-0 bg-black/50" />
      {/* card */}
      <div className="relative mx-4 w-[92%] max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_20px_60px_-20px_rgba(24,16,63,0.2)]">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500">
            <Check className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-xl font-semibold text-gray-800">บันทึกสำเร็จ!</div>
        <div className="mt-1 text-sm text-gray-500">saved successfully.</div>
      </div>
    </div>
  );
}

