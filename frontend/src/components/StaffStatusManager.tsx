"use client";
import React, { useEffect, useState } from "react";
import { X, Plus, SquarePen, Trash2 } from "lucide-react";
import {
  getStaffStatuses,
  createStaffStatus,
  updateStaffStatusName,
  deleteStaffStatus,
} from "@/lib/api/staffStatus";
import { StaffStatus, StaffStatusType } from "@/types/api/status";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  canManage: boolean; // admin เท่านั้นถึงจะ true
  onChanged?: (items: StaffStatus[]) => void; // ให้ parent reload dropdown ได้
};

export default function StaffStatusManager({
  isOpen,
  onClose,
  token,
  canManage,
  onChanged,
}: Props) {
  const [items, setItems] = useState<StaffStatus[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState<string | null>(null);
  const [newType, setNewType] = useState<StaffStatusType>(StaffStatusType.None);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await getStaffStatuses(token);
        if (!cancelled) setItems(list);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, token]);

  function pushChange(list: StaffStatus[]) {
    setItems(list);
    onChanged?.(list);
  }

  async function handleCreate() {
    if (!newName.trim()) {
      setNewNameError("กรุณากรอกชื่อสถานะ");
      return;
    }
    setNewNameError(null);
    setLoading(true);
    try {
      const created = await createStaffStatus(
        { status: newName.trim(), type: newType },
        token
      );
      pushChange([...items, created]);
      setShowAdd(false);
      setNewName("");
    } catch (e) {
      alert("สร้างสถานะไม่สำเร็จ");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: StaffStatus) {
    setEditId(item.id);
    setEditName(item.status);
  }

  async function handleEditSave() {
    if (!editId) return;
    if (!editName.trim()) return;
    setLoading(true);
    try {
      const updated = await updateStaffStatusName(
        { id: editId, status: editName.trim() },
        token
      );
      const next = items.map((s) => (s.id === editId ? updated : s));
      pushChange(next);
      setEditId(null);
      setEditName("");
    } catch (e) {
      alert("แก้ไขชื่อสถานะไม่สำเร็จ");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const id = confirmDeleteId;
    if (!id) return;
    setDeleting(true);
    try {
      await deleteStaffStatus(id, token);
      const next = items.filter((s) => s.id !== id);
      pushChange(next);
      setConfirmDeleteId(null);
    } catch (e: any) {
      alert(e?.response?.data?.error || "ลบไม่สำเร็จ");
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  if (!isOpen) return null;

  return (
    // 🔁 Backdrop/เลย์เอาต์ เหมือน QueueModal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
      {/* คลิกฉากหลังเพื่อปิด */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* กล่องหลัก: กว้าง/สูง/สกอร์ล เหมือน QueueModal */}
      <div className="relative z-[1] bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-8 w-8" />
          <h3 className="text-xl sm:text-2xl font-extrabold text-purple-700">
            จัดการสถานะเจ้าหน้าที่
          </h3>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Add new */}
        <div className="mb-4">
          <button
            type="button"
            disabled={!canManage}
            onClick={() => setShowAdd(true)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ${
              canManage
                ? "bg-[#8741D9] text-white hover:bg-[#6c33c7]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus className="h-4 w-4" />
            เพิ่มสถานะ
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 rounded-xl border border-gray-200 p-4">
            <div className="mb-2 text-sm font-semibold text-gray-700">
              สร้างสถานะใหม่
            </div>

            {/* เดิม: flex flex-col gap-2 sm:flex-row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ชื่อสถานะ"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (newNameError) setNewNameError(null);
                  }}
                  className={`w-full h-11 rounded-full border px-4 text-sm focus:outline-none ${
                    newNameError
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-[#8741D9]"
                  }`}
                />
                {newNameError && (
                  <p className="mt-1 text-xs text-red-500">
                    กรุณากรอกชื่อสถานะ
                  </p>
                )}
              </div>

              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as StaffStatusType)}
                className="w-full sm:max-w-[180px] h-11 self-start rounded-full border border-gray-300 px-4 text-sm bg-white focus:border-[#8741D9] focus:outline-none"
              >
                {Object.values(StaffStatusType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 self-start">
                <button
                  type="button"
                  disabled={loading || !canManage}
                  onClick={handleCreate}
                  className="h-11 px-5 rounded-full bg-[#8741D9] text-white text-sm font-semibold 
                 hover:bg-[#6c33c7] disabled:opacity-50 flex items-center"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setNewName("");
                    setNewNameError(null);
                  }}
                  className="h-11 px-5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold 
                 hover:bg-gray-200 flex items-center"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header ของตาราง */}
        <div className="flex justify-between px-4 py-2 text-sm font-semibold text-gray-600 border-b border-gray-200 mb-4">
          <div className="flex-1 text-left">ชื่อสถานะ</div>
          <div className="flex-1 text-center">ชนิด (Type)</div>
          <div className="flex-1 text-right"></div>
        </div>

        {/* รายการ status */}
        {items.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">
            ยังไม่มีสถานะ
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {" "}
            {/* 👈 ช่องว่างแนวตั้งระหว่างแถว */}
            {items.map((s) => {
              const isEditing = editId === s.id;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-x-4 px-4 py-3  /* 👈 ใช้ gap-x แทน space-x */
                     border border-gray-200 rounded-2xl shadow-sm bg-white"
                >
                  {/* 1) ชื่อสถานะ */}
                  <div className="flex-1 text-left">
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-full border border-gray-300 px-3 py-1.5 text-sm
                           focus:border-[#8741D9] focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {s.status}
                      </span>
                    )}
                  </div>

                  {/* 2) type */}
                  <div className="flex-1 text-center text-sm text-gray-600">
                    {s.type || "-"}
                  </div>

                  {/* 3) ปุ่มจัดการ */}
                  <div className="flex-1 flex justify-end items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={!canManage || loading}
                          onClick={handleEditSave}
                          className="rounded-full bg-[#8741D9] px-4 py-1.5 text-sm font-semibold text-white
                             hover:bg-[#6c33c7] disabled:opacity-50"
                        >
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(null);
                            setEditName("");
                          }}
                          className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold
                             text-gray-600 hover:bg-gray-50"
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          title={canManage ? "แก้ไขชื่อ" : "ต้องเป็น Admin"}
                          onClick={() => startEdit(s)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                            canManage
                              ? "border-gray-200 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600"
                              : "cursor-not-allowed border-gray-200 text-gray-300"
                          }`}
                          disabled={!canManage}
                        >
                          <SquarePen className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          title={canManage ? "ลบสถานะ" : "ต้องเป็น Admin"}
                          onClick={() => setConfirmDeleteId(s.id)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                            canManage
                              ? "border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
                              : "cursor-not-allowed border-gray-200 text-gray-300"
                          }`}
                          disabled={!canManage}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete (ทับบนโมดัลด้วย z สูงกว่า) */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="mb-2 text-center text-[15px] font-semibold text-[#8741D9]">
              ยืนยันการลบสถานะ
            </h4>
            <p className="mb-6 text-center text-[14px] text-gray-700">
              คุณต้องการลบสถานะนี้ใช่หรือไม่?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="rounded-full bg-[#8741D9] px-5 py-2 text-sm font-semibold text-white"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="rounded-full bg-[#E9D7FE] px-5 py-2 text-sm font-semibold text-[#5C2D91] disabled:opacity-70"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "กำลังลบ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
