"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronDown, ArrowLeft, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "@/lib/cookie";
import { RoleKey, ROLE_ITEMS, ROLE_LABEL, ROLE_HEADING } from "@/lib/role";
import { updateUserInfo } from "@/lib/api/user";

const isValidEmail = (value: string) =>
  /^[^\s@]+@cmu\.ac\.th$/i.test(value.trim());

interface Faculty {
  id: number;
  nameTH: string;
}

export default function AddUserPage() {
  const [role, setRole] = useState<RoleKey>("admin");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [facultyId, setFacultyId] = useState<number | null>(null);

  // modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  // อ่าน token จาก cookie
  useEffect(() => {
    const t = getCookie("backend-api-token");
    if (typeof t === "string") setToken(t);
  }, []);

  // ถ้ามี query ?email= → โหมดแก้ไข
  useEffect(() => {
    const preset = params.get("email");
    if (preset) {
      setEmail(preset);
      setEditMode(true);
      fetchUserFaculty(preset);
    }
  }, [params]);

  // โหลดรายชื่อ faculty
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/faculty", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Faculty list from API:", data);
        setFacultyList(data);
      })
      .catch((err) => console.error("โหลด faculty ไม่สำเร็จ:", err));
  }, [token]);

  const fetchUserFaculty = async (email: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/user/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      const data = await res.json();
      setRole(data.role);
      setFacultyId(data.facultyId ?? null);
    } catch (err) {
      console.error(err);
    }
  };

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

    if (facultyId === null) {
      alert("กรุณาเลือกคณะ");
      return;
    }

    const selectedFaculty = facultyList.find((f) => f.id === facultyId);
    const organization_name_th = selectedFaculty?.nameTH;
    if (!organization_name_th) {
      alert("ไม่พบชื่อคณะจากรายการ โปรดเลือกใหม่");
      return;
    }

    try {
      await updateUserInfo(
        value,
        {
          role,
          organization_name_th,
        },
        token
      );
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/setting");
      }, 2000);
    } catch (err) {
      console.error(err);
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2000);
    }
  };

  const canSave = email.trim().length > 0 && isValidEmail(email);

  return (
    <div className="min-h-screen w-full bg-[#F4EEFF] font-['Noto_Sans_Thai'] relative">
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
            {editMode ? "แก้ไขสิทธิ์ผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
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
                  {(Object.keys(ROLE_LABEL) as RoleKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ROLE_LABEL[k]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* สิทธิ์ที่ได้รับ */}
            <div className="mb-6">
              <div className="mb-2 text-sm font-medium text-gray-700">
                {ROLE_HEADING[role]}
              </div>
              <div className="space-y-3 pl-0 sm:pl-6">
                {ROLE_ITEMS[role].map((perm) => (
                  <PermissionRow key={perm} text={perm} />
                ))}
              </div>
            </div>

            {/* Faculty */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                คณะ
              </label>
              <select
                value={facultyId ?? ""}
                onChange={(e) => setFacultyId(Number(e.target.value))}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-[#6C63FF] focus:outline-none"
              >
                <option value="">-- เลือกคณะ --</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameTH}
                  </option>
                ))}
              </select>
            </div>

            {/* อีเมล CMU */}
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
                disabled={editMode}
                className={`w-full rounded-full border bg-white px-5 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#6C63FF] focus:outline-none ${
                  editMode ? "border-gray-200 text-gray-500" : "border-gray-300"
                }`}
              />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-stretch sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="w-full rounded-full bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 active:scale-[.99] disabled:opacity-40 sm:w-auto"
            >
              {editMode ? "บันทึกการเปลี่ยนแปลง" : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>
      </main>

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <Modal
          type="success"
          title="สำเร็จ!"
          message="บันทึกข้อมูลเรียบร้อยแล้ว"
        />
      )}

      {/* ❌ Error Modal */}
      {showErrorModal && (
        <Modal
          type="error"
          title="เกิดข้อผิดพลาด"
          message="ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง"
        />
      )}
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

/* ================== Modal Component ================== */
function Modal({
  type,
  title,
  message,
}: {
  type: "success" | "error";
  title: string;
  message: string;
}) {
  const color =
    type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
  const Icon = type === "success" ? Check : XCircle;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div
        className={`rounded-2xl px-8 py-6 text-center shadow-lg ${color} max-w-sm`}
      >
        <div className="flex justify-center mb-3">
          <Icon className="h-10 w-10" />
        </div>
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
