"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

type RoleKey = "super_admin" | "admin" | "staff_lifelong";

type User = {
  name?: string;
  email: string;
  role?: RoleKey;
  createdAt?: string;
};

const ROLE_BADGE: Record<RoleKey, string> = {
  super_admin: "ซูเปอร์แอดมิน",
  admin: "แอดมิน",
  staff_lifelong: "สตาฟ Lifelong",
};

const norm = (s: string) => s.trim().toLowerCase();

export default function SettingUsersPreview() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentRole, setCurrentRole] = useState<RoleKey | undefined>(undefined);
  const [currentEmail, setCurrentEmail] = useState<string | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("users");
      const parsed: User[] = raw ? JSON.parse(raw) : [];

      // แสดง admin + super_admin + staff_lifelong
      const onlyAdmins = parsed.filter(
        (u) => u.role === "admin" || u.role === "super_admin" || u.role === "staff_lifelong"
      );


      const sorted = [...onlyAdmins].sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });
      setUsers(sorted);
    } catch {
      setUsers([]);
    }

    try {
      const r = localStorage.getItem("current_role") as RoleKey | null;
      setCurrentRole(r ?? undefined);
    } catch {}
    try {
      const me = localStorage.getItem("current_email");
      if (me) setCurrentEmail(me);
    } catch {}
  }, []);

  const isSuperAdmin = currentRole === "super_admin";

  const rows = useMemo(() => {
    return users.map((u) => {
      const displayName =
        u.name?.trim()?.length ? u.name : u.email?.split("@")[0] || "ผู้ใช้ใหม่";
      const roleKey = u.role as RoleKey | undefined;
      const roleLabel = roleKey ? ROLE_BADGE[roleKey] : "ไม่ทราบสิทธิ์";
      return { ...u, displayName, roleLabel };
    });
  }, [users]);

  const handleAddUser = () => {
    if (!isSuperAdmin) {
      alert("คุณไม่มีสิทธิ์จัดการสมาชิกบัญชี (จำกัดเฉพาะ Super Admin)");
      return;
    }
    router.push("/setting/add-user");
  };

  const handleArrowClick = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSuperAdmin) {
      alert("คุณไม่มีสิทธิ์แก้ไขสิทธิ์ผู้ใช้ (จำกัดเฉพาะ Super Admin)");
      return;
    }
    router.push(`/setting/add-user?email=${encodeURIComponent(email)}`);
  };

  // เปิดโมดัลยืนยัน
  const handleDeleteClick = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSuperAdmin) {
      alert("คุณไม่มีสิทธิ์ลบผู้ใช้ (จำกัดเฉพาะ Super Admin)");
      return;
    }
    setPendingEmail(email);
    setConfirmOpen(true);
  };

  // กดยืนยันในโมดัล
  const confirmDelete = () => {
    if (!pendingEmail) return;

    const current = [...users];
    const target = current.find((u) => norm(u.email) === norm(pendingEmail));
    if (!target) {
      setConfirmOpen(false);
      setPendingEmail(null);
      return;
    }

    // เช็ค super admin คนสุดท้าย
    const superAdmins = current.filter((u) => u.role === "super_admin");
    const isTargetLastSuperAdmin =
      target.role === "super_admin" && superAdmins.length === 1;
    if (isTargetLastSuperAdmin) {
      alert("ไม่สามารถลบ Super Admin คนสุดท้ายได้");
      setConfirmOpen(false);
      setPendingEmail(null);
      return;
    }

    // กันลบตัวเองถ้าเป็น super admin คนสุดท้าย
    const amISoleSuperAdmin =
      currentEmail &&
      superAdmins.length === 1 &&
      norm(superAdmins[0].email) === norm(currentEmail) &&
      norm(pendingEmail) === norm(currentEmail);

    if (amISoleSuperAdmin) {
      alert("ไม่สามารถลบบัญชีตัวเองได้ เนื่องจากคุณเป็น Super Admin คนสุดท้าย");
      setConfirmOpen(false);
      setPendingEmail(null);
      return;
    }

    const next = current.filter((u) => norm(u.email) !== norm(pendingEmail));
    setUsers(next);
    try {
      localStorage.setItem("users", JSON.stringify(next));
    } catch {}

    setConfirmOpen(false);
    setPendingEmail(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingEmail(null);
  };

  // ปิดด้วย ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelDelete();
    };
    if (confirmOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai']">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] sm:p-8">
          <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-base font-semibold text-gray-700 sm:text-lg">การจัดการแอดมิน</h1>
            {currentRole && (
              <span className="inline-flex w-full items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 sm:w-auto">
                สิทธิ์ของฉัน: {ROLE_BADGE[currentRole as RoleKey] || "-"}
              </span>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-[#F8F7FF] p-4 sm:p-6">
            {/* Header */}
            <div className="mb-3 hidden grid-cols-12 text-xs text-gray-500 sm:mb-4 sm:grid sm:text-sm">
              <div className="col-span-4">ชื่อ</div>
              <div className="col-span-4">อีเมล (CMU)</div>
              <div className="col-span-4 pr-3 text-right">สิทธิ์ / จัดการ</div>
            </div>

            <div className="space-y-3">
              {rows.length > 0 ? (
                rows.map((u) => (
                  <div
                    key={u.email}
                    className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm sm:grid-cols-12 sm:gap-0 sm:px-4 sm:py-3"
                  >
                    {/* ชื่อ */}
                    <div className="min-w-0 sm:col-span-4">
                      <div className="text-[11px] text-gray-400 sm:hidden">ชื่อ</div>
                      <div className="truncate text-sm font-medium text-gray-700">{u.displayName}</div>
                    </div>

                    {/* อีเมล */}
                    <div className="min-w-0 sm:col-span-4">
                      <div className="mt-1 text-[11px] text-gray-400 sm:hidden">อีเมล (CMU)</div>
                      <div className="truncate text-sm text-gray-500">{u.email}</div>
                    </div>

                    {/* สิทธิ์/จัดการ */}
                    <div className="sm:col-span-4 sm:flex sm:items-center sm:justify-end sm:gap-2">
                      <div className="mt-1 flex items-center justify-between sm:mt-0 sm:block">
                        <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                          {u.roleLabel}
                        </span>

                        {/* action */}
                        <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:inline-flex sm:pl-2">
                          <button
                            title={isSuperAdmin ? "แก้ไขสิทธิ์" : "ต้องเป็น Super Admin"}
                            onClick={(e) => handleArrowClick(u.email, e)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                              isSuperAdmin
                                ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                                : "cursor-not-allowed border-gray-200 text-gray-300"
                            }`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            title={isSuperAdmin ? "ลบแอดมิน" : "ต้องเป็น Super Admin"}
                            onClick={(e) => handleDeleteClick(u.email, e)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                              isSuperAdmin
                                ? "border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                : "cursor-not-allowed border-gray-200 text-gray-300"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">ยังไม่มีแอดมิน</div>
              )}

              <button
                onClick={handleAddUser}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-4 text-sm font-medium transition ${
                  isSuperAdmin
                    ? "border-gray-200 bg-white text-gray-300 hover:text-purple-400"
                    : "cursor-not-allowed border-gray-200 bg-white text-gray-300"
                }`}
                title={isSuperAdmin ? "เพิ่มผู้ใช้ใหม่" : "ต้องเป็น Super Admin"}
              >
                <Plus className="h-5 w-5" />
                เพิ่มผู้ใช้ใหม่
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===== Confirm Delete Modal ===== */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={cancelDelete}
          />

          {/* card */}
          <div className="relative z-[101] w-[92%] max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-7">
            {/* close */}
            <button
              onClick={cancelDelete}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="ปิด"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-3 text-center text-base font-bold text-[#6C63FF]">
              ยืนยันการลบแอดมิน
            </h2>
            <p className="mb-6 text-center text-[15px] text-gray-700">
              {pendingEmail}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={cancelDelete}
                className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-[#6C2CCF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-[.99]"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-[#E6DFFF] px-5 py-2.5 text-sm font-semibold text-[#6C2CCF] shadow-sm hover:brightness-95 active:scale-[.99]"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
