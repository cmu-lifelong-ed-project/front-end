"use client";
import React, { useState } from "react";
import { CourseStatus, FacultyItem, OrderMapping, StaffStatus } from "../types/queue";
import { toDatetimeLocal } from "@/lib/ui";

type Props = {
  isOpen: boolean;
  editMode: boolean;
  title: string; setTitle: (v: string) => void;
  faculty: string; setFaculty: (v: string) => void;
  staffId: string; setStaffId: (v: string) => void;
  staffStatusId: string; setStaffStatusId: (v: string) => void;
  courseStatusId: string; setCourseStatusId: (v: string) => void;
  wordfileSubmit: string; setWordfileSubmit: (v: string) => void;
  infoSubmit: string; setInfoSubmit: (v: string) => void;
  infoSubmit14days: string; setInfoSubmit14days: (v: string) => void;
  timeRegister: string; setTimeRegister: (v: string) => void;
  onWeb: string; setOnWeb: (v: string) => void;
  appointmentDateAw: string; setAppointmentDateAw: (v: string) => void;
  dateLeft: number; setDateLeft: (v: number) => void;
  note: string; setNote: (v: string) => void;

  facultyList: FacultyItem[];
  courseStatusList: CourseStatus[];
  staffStatusList: StaffStatus[];

  onSubmit: () => void;
  onClose: () => void;

  orderMappings: OrderMapping[];
  setOrderMappings: React.Dispatch<React.SetStateAction<OrderMapping[]>>;
  currentId: number | null;
  onToggleOrder: (listQueueId: number, orderId: number, checked: boolean) => Promise<void>;
  token: string;
};

export default function QueueModal(props: Props) {
  const {
    isOpen, editMode,
    title, setTitle,
    faculty, setFaculty,
    staffId, setStaffId,
    staffStatusId, setStaffStatusId,
    courseStatusId, setCourseStatusId,
    wordfileSubmit, setWordfileSubmit,
    infoSubmit, setInfoSubmit,
    infoSubmit14days, setInfoSubmit14days,
    timeRegister, setTimeRegister,
    onWeb, setOnWeb,
    appointmentDateAw, setAppointmentDateAw,
    dateLeft, setDateLeft,
    note, setNote,
    facultyList, courseStatusList, staffStatusList,
    onSubmit, onClose,
    orderMappings, setOrderMappings, currentId, onToggleOrder, token,
  } = props;

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [newOrderTitle, setNewOrderTitle] = useState("");

  if (!isOpen) return null;

  // input styles
  const inputBase =
    "rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm border border-gray-200 text-gray-400 placeholder:text-gray-400";
  const selectBase =
    "rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm border border-gray-200 text-gray-400";
  const textareaBase =
    "rounded-2xl px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none border border-gray-200 text-gray-400 placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 overflow-auto max-h-[90vh] relative">
        <h3 className="text-xl sm:text-2xl font-extrabold text-center text-purple-700 mb-6">
          {editMode ? "Edit Queue" : "Create New Queue"}
        </h3>

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title</span>
            <input type="text" className={inputBase} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          {/* Faculty */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Faculty</span>
            <select className={selectBase} value={faculty} onChange={(e) => setFaculty(e.target.value)} required>
              <option value="">-- Select Faculty --</option>
              {facultyList.map((fac) => (
                <option key={fac.id} value={String(fac.id)}>
                  {fac.nameTH} ({fac.code})
                </option>
              ))}
            </select>
          </label>

          {/* Staff ID */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Staff ID</span>
            <input type="number" className={inputBase} value={staffId} onChange={(e) => setStaffId(e.target.value)} required />
          </label>

          {/* Staff Status */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Staff Status</span>
            <select className={selectBase} value={staffStatusId} onChange={(e) => setStaffStatusId(e.target.value)} required>
              <option value="">-- Select Status --</option>
              {staffStatusList.map((s) => (
                <option key={s.id} value={s.id}>{s.status}</option>
              ))}
            </select>
          </label>

          {/* Course Status */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Course Status</span>
            <select className={selectBase} value={courseStatusId} onChange={(e) => setCourseStatusId(e.target.value)}>
              <option value="">-- Select Course Status --</option>
              {courseStatusList.map((c) => (
                <option key={c.id} value={c.id}>{c.status}</option>
              ))}
            </select>
          </label>

          {/* Wordfile submit */}
          <DateInput label="วันที่ได้รับไฟล์ Word (wordfile submit)" value={wordfileSubmit} onChange={setWordfileSubmit} inputBase={inputBase} />

          {/* Info submit */}
          <DateInput label="วันที่ได้รับบันทึกข้อความ (info submit)" value={infoSubmit} onChange={setInfoSubmit} inputBase={inputBase} />

          {/* Info submit 14 days */}
          <DateInput label="กรอบเวลา 14 วัน (info submit 14days)" value={infoSubmit14days} onChange={setInfoSubmit14days} inputBase={inputBase} />

          {/* Time register */}
          <DateInput label="วันที่เปิดรับสมัคร (time register)" value={timeRegister} onChange={setTimeRegister} inputBase={inputBase} />

          {/* On web */}
          <DateInput label="วันที่ต้องขึ้นเว็บ (on web)" value={onWeb} onChange={setOnWeb} inputBase={inputBase} />

          {/* Appointment */}
          <DateInput label="วันที่นัดหมาย (appointment data aw)" value={appointmentDateAw} onChange={setAppointmentDateAw} inputBase={inputBase} />

          {/* Date left */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">เหลือเวลา (date left) (วัน)</span>
            <input type="number" min={0} className={inputBase} value={dateLeft} onChange={(e) => setDateLeft(Number(e.target.value))} />
          </label>

          {/* Orders */}
          {orderMappings?.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-sm font-semibold block mb-2">Orders</span>
              <div className="space-y-2">
                {orderMappings.map((om) => (
                  <label key={String(om.id)} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={om.checked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOrderMappings((prev) => prev.map((o) => (o.id === om.id ? { ...o, checked } : o)));
                        if (currentId && om.order?.id) {
                          onToggleOrder(currentId, om.order.id, checked);
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{om.order?.title}</span>
                  </label>
                ))}
              </div>

              {/* Add Order button + popup */}
              <button
                type="button"
                className="mt-2 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                onClick={() => setShowAddOrder(true)}
              >
                + Add Order
              </button>

              {showAddOrder && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Create New Order</h2>
                    <input
                      type="text"
                      value={newOrderTitle}
                      onChange={(e) => setNewOrderTitle(e.target.value)}
                      placeholder="Enter order title..."
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold"
                        onClick={() => { setShowAddOrder(false); setNewOrderTitle(""); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
                        onClick={async () => {
                          if (!newOrderTitle || !currentId) return;
                          try {
                            const res = await fetch("http://localhost:8080/api/order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              credentials: "include",
                              body: JSON.stringify({ list_queue_id: currentId, title: newOrderTitle }),
                            });
                            if (!res.ok) throw new Error("Create order failed");
                            const newOrder = await res.json();

                            // ใช้ randomUUID ไม่ต้องพึ่ง uuid pkg
                            const localId = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

                            setOrderMappings((prev) => [
                              ...prev,
                              {
                                id: newOrder.mapping_id ?? localId,
                                order_id: newOrder.id,
                                checked: false,
                                order: { id: newOrder.id, title: newOrder.title },
                              },
                            ]);

                            setShowAddOrder(false);
                            setNewOrderTitle("");
                          } catch (err) {
                            console.error(err);
                            alert("สร้าง Order ไม่สำเร็จ");
                          }
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold">Note</span>
            <textarea
              rows={3}
              placeholder="ใส่บันทึกเพิ่มเติม..."
              className={textareaBase}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3 sm:gap-4 mt-2 sm:mt-4">
            <button type="button" className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
              {editMode ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DateInput({
  label, value, onChange, inputBase,
}: { label: string; value: string; onChange: (v: string) => void; inputBase: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="datetime-local"
        placeholder="dd/mm/yyyy, --:--"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
        required
      />
    </label>
  );
}
