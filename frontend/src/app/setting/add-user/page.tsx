"use client";

import React, { useMemo, useState } from "react";
import { Plus, Check, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// คอนฟิกสิทธิ์
const ITEMS = [
  "แก้ไขการตั้งค่าเว็บไซต์",
  "การจัดการสมาชิกบัญชี",
  "ข้อมูลเชิงลึก",
] as const;
type Item = (typeof ITEMS)[number];

type RoleKey = "super_admin" | "admin" | "staff_lifelong";

const ROLE_ITEMS: Record<RoleKey, Item[]> = {
  super_admin: ["แก้ไขการตั้งค่าเว็บไซต์", "การจัดการสมาชิกบัญชี", "ข้อมูลเชิงลึก"],
  admin: ["แก้ไขการตั้งค่าเว็บไซต์", "ข้อมูลเชิงลึก"],
  staff_lifelong: ["ข้อมูลเชิงลึก"],
};

const ROLE_LABEL: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff_lifelong: "Staff Lifelong",
};

const ROLE_HEADING: Record<RoleKey, string> = {
  super_admin: "ซูเปอร์แอดมิน",
  admin: "แอดมิน",
  staff_lifelong: "สตาฟ Lifelong",
};

export default function AddUserPage() {
  const [role, setRole] = useState<RoleKey>("super_admin");
  const allowed = useMemo(() => ROLE_ITEMS[role], [role]);
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai']">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-3xl bg-white p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] sm:p-8">
          
          {/* ปุ่มย้อนกลับ */}
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
        
          </button>

          <h1 className="mb-6 text-base font-semibold text-gray-700 sm:text-lg">
            การจัดการผู้ใช้
          </h1>

          {/* กล่องเนื้อหา */}
          <div className="rounded-3xl border border-gray-100 bg-[#F8F7FF] p-6">
            {/* ประเภทสิทธิ์ */}
            <div className="mb-6">
              <label className="mb-4 block text-sm font-medium text-gray-700">ประเภทสิทธิ์</label>
              <div className="relative inline-block">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleKey)}
                  className="appearance-none rounded-full border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:border-[#6C63FF] focus:outline-none"
                >
                  {(Object.keys(ROLE_LABEL) as RoleKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ROLE_LABEL[k]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* สิทธิ์ที่ได้รับ */}
            <div className="mb-6">
              <div className="mb-2 text-sm font-medium text-gray-700">{ROLE_HEADING[role]}</div>
              <div className="space-y-3 pl-6">
                {allowed.includes("แก้ไขการตั้งค่าเว็บไซต์") && <PermissionRow text="แก้ไขการตั้งค่าเว็บไซต์" />}
                {allowed.includes("การจัดการสมาชิกบัญชี") && <PermissionRow text="การจัดการสมาชิกบัญชี" />}
                {allowed.includes("ข้อมูลเชิงลึก") && <PermissionRow text="ข้อมูลเชิงลึก" />}
              </div>
            </div>

            {/* วิธีส่งคำเชิญ */}
            <div className="mt-8 ">
              <div className="mb-2 text-sm font-medium text-gray-700">วิธีส่งคำเชิญ</div>
              <div className="pl-6 flex items-center gap-2 text-sm text-gray-500">
                <span>เพิ่มด้วยเมล CMU Account</span>
                <button
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50"
                  aria-label="add-cmu-account"
                  onClick={() => alert("(เดโม่) เพิ่มด้วย CMU Account")}
                >
                  <Plus className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="mt-8 flex justify-center">
            <button className="rounded-full bg-[#6C63FF] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 active:scale-[.99]">
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function PermissionRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm leading-tight text-gray-500">
      <span>{text}</span>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}
