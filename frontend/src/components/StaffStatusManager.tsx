"use client";
import React, { useState } from "react";

type StaffStatus = { id: number; status: string; type: string; };

type Props = {
  list: StaffStatus[];
  token: string;
  onUpdated: (list: StaffStatus[]) => void;
};

export default function StaffStatusManager({ list, token, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newStatus.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/staffstatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      onUpdated([...list, created]);
      setNewStatus("");
    } catch (err) {
      console.error(err);
      alert("เพิ่มสถานะไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("ยืนยันการลบสถานะนี้หรือไม่?")) return;
    try {
      const res = await fetch(`http://localhost:8080/staffstatus/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      onUpdated(list.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("ลบไม่สำเร็จ");
    }
  }

  async function handleEdit(id: number, status: string) {
    const newName = prompt("แก้ไขชื่อสถานะ:", status);
    if (!newName || newName.trim() === status) return;
    try {
      const res = await fetch("http://localhost:8080/staffstatus/name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newName }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      onUpdated(list.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
      alert("อัปเดตไม่สำเร็จ");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-purple-600 hover:underline ml-2"
      >
        จัดการสถานะ
      </button>

      {open && (
        <div className="border rounded-xl p-3 mt-2 bg-purple-50 space-y-2">
          <div className="flex gap-2">
            <input
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="เพิ่มสถานะใหม่"
              className="flex-1 rounded-lg border p-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"
            >
              {loading ? "..." : "เพิ่ม"}
            </button>
          </div>

          <ul className="max-h-40 overflow-y-auto text-sm">
            {list.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border-b py-1"
              >
                <span>{s.status}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(s.id, s.status)}
                    className="text-blue-600 hover:underline"
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
