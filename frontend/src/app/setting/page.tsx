"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookie";

type RoleKey = "admin" | "staff" | "LE" | "officer";

type User = {
  id: string;
  firstname_th?: string;
  lastname_th?: string;
  cmuitaccount: string;
  role?: RoleKey;
  organization_name_th?: string;
  createdAt?: string;
};

// เพิ่ม role LE และ officer
const ROLE_BADGE: Record<string, string> = {
  admin: "แอดมิน",
  staff: "เจ้าหน้าที่",
  super_admin: "ซูเปอร์แอดมิน",
  LE: "LE",
  officer: "เจ้าหน้าที่ LE",
};

const norm = (s: string) => s.trim().toLowerCase();

export default function SettingUsersPreview() {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [currentRole, setCurrentRole] = useState<RoleKey | undefined>(undefined);
  const router = useRouter();

  // อ่าน token, role จาก cookie
  useEffect(() => {
    const t = getCookie("backend-api-token");
    if (typeof t === "string") setToken(t);

    const r = getCookie("current_role") as RoleKey | null;
    if (r) setCurrentRole(r);
  }, []);

  // โหลด users จาก API
  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");

        const data: User[] = await res.json();
        console.log("Raw users from API:", data);

        // เรียงตาม createdAt ใหม่ล่าสุดก่อน
        const sorted = [...data].sort((a, b) => {
          const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
          const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
          return tb - ta;
        });

        console.log("Sorted users by createdAt:", sorted);
        setUsers(sorted);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [token]);

  // เตรียม rows สำหรับ UI
  const rows = useMemo(() => {
    return users.map((u) => {
      const displayName =
        u.firstname_th || u.lastname_th
          ? `${u.firstname_th || ""} ${u.lastname_th || ""}`.trim()
          : u.cmuitaccount.split("@")[0];

      return {
        ...u,
        displayName,
        roleLabel: u.role ? ROLE_BADGE[u.role] : "-",
      };
    });
  }, [users]);

  const handleAddUser = () => router.push("/setting/edit-user");

  const handleArrowClick = (cmuitaccount: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/setting/edit-user?email=${encodeURIComponent(cmuitaccount)}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`ยืนยันการลบผู้ใช้นี้?`)) return;
    if (!token) {
      alert("ไม่พบ token");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      // อัปเดต state หลังลบสำเร็จ
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบ");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai']">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl bg-white p-4 shadow sm:p-8">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-base font-semibold text-gray-700 sm:text-lg">การจัดการผู้ใช้</h1>
            {currentRole && (
              <span className="inline-flex w-full items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 sm:w-auto">
                สิทธิ์ของฉัน: {ROLE_BADGE[currentRole]}
              </span>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-[#F8F7FF] p-4 sm:p-6">
            {/* Table header */}
            <div className="mb-3 hidden grid-cols-12 text-xs text-gray-500 sm:mb-4 sm:grid sm:text-sm">
              <div className="col-span-3">ชื่อ</div>
              <div className="col-span-3">อีเมล (CMU)</div>
              <div className="col-span-3">คณะ / หน่วยงาน</div>
              <div className="col-span-3 pr-3 text-right">สิทธิ์ / จัดการ</div>
            </div>

            <div className="space-y-3">
              {rows.length > 0 ? (
                rows.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm sm:grid-cols-12 sm:gap-0 sm:px-4 sm:py-3"
                  >
                    <div className="min-w-0 sm:col-span-3">
                      <div className="text-[11px] text-gray-400 sm:hidden">ชื่อ</div>
                      <div className="truncate text-sm font-medium text-gray-700">{u.displayName}</div>
                    </div>
                    <div className="min-w-0 sm:col-span-3">
                      <div className="mt-1 text-[11px] text-gray-400 sm:hidden">อีเมล (CMU)</div>
                      <div className="truncate text-sm text-gray-500">{u.cmuitaccount}</div>
                    </div>
                    <div className="min-w-0 sm:col-span-3">
                      <div className="mt-1 text-[11px] text-gray-400 sm:hidden">คณะ / หน่วยงาน</div>
                      <div className="truncate text-sm text-gray-500">{u.organization_name_th || "-"}</div>
                    </div>
                    <div className="sm:col-span-3 sm:flex sm:items-center sm:justify-end sm:gap-2">
                      <div className="mt-1 flex items-center justify-between sm:mt-0 sm:block">
                        <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                          {u.roleLabel}
                        </span>
                        <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:inline-flex sm:pl-2">
                          <button
                            title="แก้ไขสิทธิ์"
                            onClick={(e) => handleArrowClick(u.cmuitaccount, e)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            title="ลบผู้ใช้"
                            onClick={(e) => handleDelete(u.id, e)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">ยังไม่มีผู้ใช้</div>
              )}

              <button
                onClick={handleAddUser}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-3 py-4 text-sm font-medium text-gray-400 hover:text-purple-400"
                title="เพิ่มผู้ใช้ใหม่"
              >
                <Plus className="h-5 w-5" />
                เพิ่มผู้ใช้ใหม่
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
