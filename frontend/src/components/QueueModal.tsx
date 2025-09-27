"use client";
import React, { useEffect, useState } from "react";
import { CourseStatus, StaffStatus } from "@/types/api/status";
import { FacultyItem } from "@/types/api/faculty";
import { OrderMapping } from "@/types/api/order";

type Props = {
  isOpen: boolean;
  editMode: boolean;

  title: string;
  setTitle: (v: string) => void;
  faculty: string;
  setFaculty: (v: string) => void;
  staffId: string;
  setStaffId: (v: string) => void;
  staffStatusId: string;
  setStaffStatusId: (v: string) => void;
  courseStatusId: string;
  setCourseStatusId: (v: string) => void;

  wordfileSubmit: string;
  setWordfileSubmit: (v: string) => void;
  infoSubmit: string;
  setInfoSubmit: (v: string) => void;
  infoSubmit14days: string;
  setInfoSubmit14days: (v: string) => void;
  timeRegister: string;
  setTimeRegister: (v: string) => void;
  onWeb: string;
  setOnWeb: (v: string) => void;
  appointmentDateAw: string;
  setAppointmentDateAw: (v: string) => void;

  dateLeft: number;
  setDateLeft: (v: number) => void;
  note: string;
  setNote: (v: string) => void;

  facultyList: FacultyItem[];
  courseStatusList: CourseStatus[];
  staffStatusList: StaffStatus[];

  onSubmit: () => void;
  onClose: () => void;

  orderMappings: OrderMapping[];
  setOrderMappings: React.Dispatch<React.SetStateAction<OrderMapping[]>>;
  currentId: number | null;
  onToggleOrder: (
    listQueueId: number,
    orderId: number,
    checked: boolean
  ) => Promise<void>;
  token: string;

  /** ✅ ใหม่: แจ้ง parent เมื่อจำนวนงาน/งานที่เสร็จเปลี่ยน */
  onOrdersChanged?: (
    listQueueId: number,
    summary: { done: number; total: number }
  ) => void;
};

export default function QueueModal(props: Props) {
  const {
    isOpen,
    editMode,
    title,
    setTitle,
    faculty,
    setFaculty,
    staffId,
    setStaffId,
    staffStatusId,
    setStaffStatusId,
    courseStatusId,
    setCourseStatusId,
    wordfileSubmit,
    setWordfileSubmit,
    infoSubmit,
    setInfoSubmit,
    infoSubmit14days,
    setInfoSubmit14days,
    timeRegister,
    setTimeRegister,
    onWeb,
    setOnWeb,
    appointmentDateAw,
    setAppointmentDateAw,
    dateLeft,
    setDateLeft,
    note,
    setNote,
    facultyList,
    courseStatusList,
    staffStatusList,
    onSubmit,
    onClose,
    orderMappings,
    setOrderMappings,
    currentId,
    onToggleOrder,
    token,
    onOrdersChanged,
  } = props;

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [newOrderTitle, setNewOrderTitle] = useState("");
  const [orderView, setOrderView] = useState<"all" | "done">("all");

  // สรุปจำนวนงานเสร็จ/ทั้งหมด
  function summarize(oms: OrderMapping[]) {
    const total = oms.length;
    const done = oms.filter((o) => o.checked).length;
    return { done, total };
  }

  // แจ้ง parent เมื่อ modal ผูกกับคิว (เปิด/เปลี่ยนคิว)
  useEffect(() => {
    if (currentId && onOrdersChanged) {
      onOrdersChanged(currentId, summarize(orderMappings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  if (!isOpen) return null;

  // input styles
  const inputBase =
    "rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm border border-gray-200 text-gray-400 placeholder:text-gray-400";
  const selectBase =
    "rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm border border-gray-200 text-gray-400";
  const textareaBase =
    "rounded-2xl px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none border border-gray-200 text-gray-400 placeholder:text-gray-400";

  // ค่า progress สำหรับ header การ์ดสรุป (ถ้าจะโชว์)
  const totalOrders = orderMappings.length;
  const doneOrders = orderMappings.filter((o) => o.checked).length;
  const percent = totalOrders
    ? Math.round((doneOrders / totalOrders) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 overflow-auto max-h-[90vh] relative">
        <h3 className="text-xl sm:text-2xl font-extrabold text-center text-purple-700 mb-6">
          {editMode ? "แก้ไขรายการคิว" : "สร้างรายการคิวใหม่"}
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Title ชื่อเรื่อง */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">ชื่อเรื่อง</span>
            <input
              type="text"
              className={inputBase}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {/* Faculty คณะ */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">คณะ</span>
            <select
              className={selectBase}
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              required
            >
              {/*<option value="">-- Select Faculty --</option>*/}*
              <option value="">-- เลือกคณะ --</option>*
              {facultyList.map((fac) => (
                <option key={fac.id} value={String(fac.id)}>
                  {fac.nameTH} ({fac.code})
                </option>
              ))}
            </select>
          </label>

          {/* Staff ID รหัสเจ้าหน้าที่*/}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">
              รหัสประจำตัวเจ้าหน้าที่
            </span>
            <input
              type="number"
              className={inputBase}
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
          </label>

          {/* Staff Status สถานะเจ้าหน้าที่ */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">สถานะเจ้าหน้าที่</span>
            <select
              className={selectBase}
              value={staffStatusId}
              onChange={(e) => setStaffStatusId(e.target.value)}
              required
            >
              <option value="">-- Select Status --</option>
              {staffStatusList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.status}
                </option>
              ))}
            </select>
          </label>

          {/* Course Status สถานะรายวิชา */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">สถานะรายวิชา</span>
            <select
              className={selectBase}
              value={courseStatusId}
              onChange={(e) => setCourseStatusId(e.target.value)}
            >
              <option value="">-- เลือก สถานะรายวิชา --</option>
              {courseStatusList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.status}
                </option>
              ))}
            </select>
          </label>

          {/* Wordfile submit */}
          <DateInput
            label="วันที่ได้รับไฟล์ Word"
            value={wordfileSubmit}
            onChange={setWordfileSubmit}
            inputBase={inputBase}
          />

          {/* Info submit */}
          <DateInput
            label="วันที่ได้รับบันทึกข้อความ"
            value={infoSubmit}
            onChange={setInfoSubmit}
            inputBase={inputBase}
          />

          {/* Info submit 14 days */}
          <DateInput
            label="กรอบเวลา 14 วัน"
            value={infoSubmit14days}
            onChange={setInfoSubmit14days}
            inputBase={inputBase}
          />

          {/* Time register */}
          <DateInput
            label="วันที่เปิดรับสมัคร"
            value={timeRegister}
            onChange={setTimeRegister}
            inputBase={inputBase}
          />

          {/* On web */}
          <DateInput
            label="วันที่ต้องขึ้นเว็บ"
            value={onWeb}
            onChange={setOnWeb}
            inputBase={inputBase}
          />

          {/* Appointment */}
          <DateInput
            label="วันที่นัดหมาย"
            value={appointmentDateAw}
            onChange={setAppointmentDateAw}
            inputBase={inputBase}
          />

          {/* Orders */}
          {orderMappings?.length > 0 && (
            <div className="md:col-span-2">
              {/* Header */}
              <h3 className="text-sm font-semibold mb-2">เตือนความจำ</h3>

              {/* การ์ดสรุป: ทั้งหมด / เสร็จแล้ว */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                {/* ทั้งหมด */}
                <button
                  type="button"
                  onClick={() => setOrderView("all")}
                  className={`flex items-center justify-between rounded-3xl px-4 py-4 shadow-sm border transition
                    ${
                      orderView === "all"
                        ? "bg-purple-50 border-purple-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <img
                      src="/queuecard/list.png"
                      alt="list icon"
                      className="h-5 w-5"
                    />
                    ทั้งหมด
                  </span>
                  <span className="text-base font-semibold">
                    {orderMappings.length}
                  </span>
                </button>

                {/* เสร็จแล้ว */}
                <button
                  type="button"
                  onClick={() => setOrderView("done")}
                  className={`flex items-center justify-between rounded-3xl px-4 py-4 shadow-sm border transition
                    ${
                      orderView === "done"
                        ? "bg-purple-50 border-purple-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <img
                      src="/queuecard/checked.png"
                      alt="checked icon"
                      className="h-5 w-5"
                    />
                    เสร็จแล้ว
                  </span>
                  <span className="text-base font-semibold">
                    {orderMappings.filter((o) => o.checked).length}
                  </span>
                </button>
              </div>

              {/* รายการงาน: all = แสดงงานค้าง / done = แสดงงานเสร็จ */}
              <div className="space-y-3">
                {orderMappings
                  .filter((o) =>
                    orderView === "done" ? o.checked : !o.checked
                  )
                  .map((om) => {
                    const id = `order-${String(om.id)}`;
                    const checked = !!om.checked;
                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {/* วงกลมแบบ radio-like */}
                        <span
                          className={`relative inline-flex h-5 w-5 items-center justify-center rounded-full border
                            ${
                              checked ? "border-[#8741D9]" : "border-gray-300"
                            }`}
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setOrderMappings((prev) => {
                                const next = prev.map((o) =>
                                  o.id === om.id
                                    ? { ...o, checked: isChecked }
                                    : o
                                );
                                if (currentId && onOrdersChanged) {
                                  onOrdersChanged(currentId, summarize(next));
                                }
                                return next;
                              });
                              if (currentId && om.order?.id) {
                                onToggleOrder(
                                  currentId,
                                  om.order.id,
                                  isChecked
                                );
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            aria-describedby={`${id}-label`}
                          />
                          {checked && (
                            <span className="h-2.5 w-2.5 rounded-full bg-[#8741D9]" />
                          )}
                        </span>

                        <span
                          id={`${id}-label`}
                          className="text-sm text-gray-900"
                        >
                          {om.order?.title}
                        </span>
                      </label>
                    );
                  })}
              </div>

              {/* ปุ่มเพิ่มเตือนความจำ */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddOrder(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#8741D9] text-white text-sm font-semibold hover:bg-[#5a54d6]"
                >
                  + เตือนความจำใหม่
                </button>
              </div>

              {showAddOrder && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      เตือนความจำใหม่
                    </h2>
                    <input
                      type="text"
                      value={newOrderTitle}
                      onChange={(e) => setNewOrderTitle(e.target.value)}
                      placeholder="กรอกสิ่งที่ต้องทำ..."
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold"
                        onClick={() => {
                          setShowAddOrder(false);
                          setNewOrderTitle("");
                        }}
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-[#8741D9] text-white hover:bg-[#4a46b3] text-sm font-semibold"
                        onClick={async () => {
                          if (!newOrderTitle || !currentId) return;
                          try {
                            const res = await fetch(
                              "http://localhost:8080/api/order",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                  list_queue_id: currentId,
                                  title: newOrderTitle,
                                }),
                              }
                            );
                            if (!res.ok) throw new Error("Create order failed");
                            const newOrder = await res.json();

                            // ใช้ randomUUID ไม่ต้องพึ่ง uuid pkg
                            const localId =
                              typeof crypto?.randomUUID === "function"
                                ? crypto.randomUUID()
                                : `${Date.now()}-${Math.random()}`;

                            setOrderMappings((prev) => {
                              const next = [
                                ...prev,
                                {
                                  id: newOrder.mapping_id ?? localId,
                                  order_id: newOrder.id,
                                  checked: false,
                                  order: {
                                    id: newOrder.id,
                                    title: newOrder.title,
                                  },
                                },
                              ];
                              if (currentId && onOrdersChanged) {
                                onOrdersChanged(currentId, summarize(next));
                              }
                              return next;
                            });

                            setShowAddOrder(false);
                            setNewOrderTitle("");
                          } catch (err) {
                            console.error(err);
                            alert("สร้าง Order ไม่สำเร็จ");
                          }
                        }}
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold">โน้ต</span>
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
            <button
              type="button"
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#8741D9] hover:bg-[#4a44b8] text-white text-sm font-semibold"
            >
              {editMode ? "บันทึก" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  inputBase,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputBase: string;
}) {
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
