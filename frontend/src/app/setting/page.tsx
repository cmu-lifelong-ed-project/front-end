import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SettingUserManagement() {
  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai']">
      {/* PAGE CONTENT */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-3xl bg-white p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] sm:p-8">
          <h1 className="mb-6 text-base font-semibold text-gray-700 sm:text-lg">
            การจัดการผู้ใช้
          </h1>

          {/* Form Card */}
          <div className="rounded-3xl border border-gray-100 bg-[#F8F7FF] p-5 sm:p-6">
            <div className="grid grid-cols-12 items-center gap-3">
              {/* Labels */}
              <div className="col-span-12 mb-1 grid grid-cols-12 text-xs text-gray-500 sm:text-sm">
                <div className="col-span-6">ชื่อผู้ใช้</div>
                <div className="col-span-6">อีเมล</div>
              </div>

              {/* Plus Button (Link) */}
              <div className="col-span-12">
                <Link href="/setting/add-user">
                  <div className="flex w-full cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 hover:bg-gray-50">
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
