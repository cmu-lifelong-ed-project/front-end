"use client";
import React, { useEffect, useState } from "react";
import { Noto_Sans_Thai } from "next/font/google";
import Image from "next/image";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------- Font ---------- */
const notoSansThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  display: "swap",
});

/* ---------- Types ---------- */
type CardItem = {
  id: number;
  priority: number;
  title: string;
  faculty: string;
  staff_id: number;
  staff_status: { id: number; status: string };
  user_status: { id: number; status: string };
  course_status_id?: number;
  note?: string;
  wordfile_submit?: string;
  info_submit?: string;
  info_submit_14days?: string;
  time_register?: string;
  date_left?: number;
  on_web?: string;
  appointment_data_aw?: string; // raw string (backend expects raw)
};

type StaffStatus = { id: number; status: string; type: string };
type UserStatus = { id: number; status: string; type: string };
type StatusMapping = { staff_status_id: number; user_status_id: number };
type FacultyItem = { id: number; code: string; nameTH: string; nameEN: string };
type CourseStatus = { id: number; status: string; type: string };

/* ---------- UI constants ---------- */
const COURSE_STATUS_COLORS: Record<string, string> = {
  "Not Started": "#9E9E9E",
  "In Progress": "#2196F3",
  "Almost Complete": "#FFC107",
  Completed: "#4CAF50",
  Pause: "#9C27B0",
  Cancel: "#F44336",
};
const TITLE_GRADIENTS: Record<string, [string, string]> = {
  "Not Started": ["#BDBDBD", "#616161"],
  "In Progress": ["#A9D9FF", "#1D90F6"],
  "Almost Complete": ["#FFCA28", "#FB8C00"],
  Completed: ["#6AE770", "#2B752F"],
  Pause: ["#AB47BC", "#6A1B9A"],
  Cancel: ["#EF5350", "#C62828"],
};
function getTitleGradient(statusName?: string) {
  const key = statusName ?? "Not Started";
  const [c0, c1] = TITLE_GRADIENTS[key] ?? TITLE_GRADIENTS["Not Started"];
  return `linear-gradient(90deg, ${c0}, ${c1})`;
}
const QUEUE_NUMBER_PURPLE = "#7D3F98";

/* ---------- Helpers ---------- */
function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function getStatusColorByName(name?: string) {
  if (!name) return "#9E9E9E";
  return COURSE_STATUS_COLORS[name] ?? "#9E9E9E";
}
function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }
  return "";
}

/* ---------- Countdown ---------- */
function formatDHMS(totalSeconds: number) {
  const d = Math.max(0, Math.floor(totalSeconds / 86400));
  const h = Math.max(0, Math.floor((totalSeconds % 86400) / 3600));
  const m = Math.max(0, Math.floor((totalSeconds % 3600) / 60));
  const s = Math.max(0, Math.floor(totalSeconds % 60));
  const pad = (n: number) => String(n).padStart(2, "0");
  return { days: d, hours: pad(h), mins: pad(m), secs: pad(s) };
}
function DateLeftCountdown({
  initialDays,
  colorHex,
}: { initialDays: number | undefined; colorHex: string }) {
  const startSeconds = Math.max(0, Math.floor((initialDays ?? 0) * 86400));
  const [secondsLeft, setSecondsLeft] = React.useState<number>(startSeconds);
  React.useEffect(() => setSecondsLeft(startSeconds), [startSeconds]);
  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);
  const { days, hours, mins, secs } = formatDHMS(secondsLeft);
  return (
    <div className="flex flex-col items-end select-none">
      <div className="flex items-baseline gap-2">
        <span
          className="uppercase tracking-[0.16em] text-[10px] sm:text-xs font-semibold -top-1 relative"
          style={{ color: colorHex }}
        >
          Date Left
        </span>
        <div className="flex items-baseline gap-2 text-[#514F54]">
          <span className="text-base sm:text-lg md:text-xl">{String(days).padStart(2, "0")}</span>
          <span className="text-base sm:text-lg md:text-xl">:</span>
          <span className="text-base sm:text-lg md:text-xl">{hours}</span>
          <span className="text-base sm:text-lg md:text-xl">:</span>
          <span className="text-base sm:text-lg md:text-xl">{mins}</span>
          <span className="text-base sm:text-lg md:text-xl">:</span>
          <span className="text-base sm:text-lg md:text-xl">{secs}</span>
        </div>
      </div>
      <div className="mt-0.5 flex gap-3 text-[9px] text-[#C8C8C8]">
        <span>Days</span><span>Hours</span><span>Minutes</span><span>Seconds</span>
      </div>
    </div>
  );
}

/* ---------- Reusable Overlays ---------- */
function Backdrop({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden
    />
  );
}

function DialogShell({ children, widthClass = "max-w-md" }: { children: React.ReactNode; widthClass?: string; }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${widthClass} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <Backdrop onClose={onCancel} />
      <DialogShell>
        <div className="p-6 sm:p-8 text-center">
          <h4 className="text-xl font-extrabold text-[#7D3F98]">{title}</h4>
          <p className="mt-2 text-sm text-gray-700">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </DialogShell>
    </>
  );
}

function SuccessOverlay({
  title = "Thank You !",
  message = "Your Action Successful",
  onClose,
  autoCloseMs = 2000, // 2 วิ
}: {
  title?: string;
  message?: string;
  onClose: () => void;
  autoCloseMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [onClose, autoCloseMs]);

  return (
    <>
      <Backdrop />
      <DialogShell widthClass="max-w-[360px]">
        <div className="p-8 text-center">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-full grid place-items-center"
            style={{ backgroundColor: "rgba(52,199,89,0.12)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#34C759" strokeWidth="2" />
              <path d="M7 12.5l3 3 7-7" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h4 className="text-xl font-extrabold text-[#2D3748]">{title}</h4>
          <p className="mt-1 text-sm text-[#6B7280]">{message}</p>
        </div>
      </DialogShell>
    </>
  );
}

/* ---------- Page ---------- */
export default function QueuePage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [title, setTitle] = useState("");
  const [faculty, setFaculty] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffStatusId, setStaffStatusId] = useState("");
  const [courseStatusId, setCourseStatusId] = useState("");
  const [note, setNote] = useState("");

  // datetime-local fields
  const [wordfileSubmit, setWordfileSubmit] = useState("");
  const [infoSubmit, setInfoSubmit] = useState("");
  const [infoSubmit14days, setInfoSubmit14days] = useState("");
  const [timeRegister, setTimeRegister] = useState("");
  const [dateLeft, setDateLeft] = useState(0);
  const [onWeb, setOnWeb] = useState("");
  const [appointmentDataAw, setAppointmentDataAw] = useState(""); // datetime-local string

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [token, setToken] = useState("");

  const [staffStatusList, setStaffStatusList] = useState<StaffStatus[]>([]);
  const [userStatusList, setUserStatusList] = useState<UserStatus[]>([]);
  const [statusMappings, setStatusMappings] = useState<StatusMapping[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [courseStatusList, setCourseStatusList] = useState<CourseStatus[]>([]);

  const [showSuccess, setShowSuccess] = useState<null | { mode: "create" | "edit" }>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ทำให้ลากเริ่มหลังขยับ 8px กันเผลอแตะ
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /* ---------- Shared input classes ---------- */
  const inputBase =
    "rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm border border-gray-200 text-gray-400 placeholder:text-gray-400";
  const selectBase =
    "rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm border border-gray-200 text-gray-400";
  const textareaBase =
    "rounded-2xl px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none border border-gray-200 text-gray-400 placeholder:text-gray-400";

  function getCookie(name: string) {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  }
  function clearCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }

  // ปุ่ม logout ด้านบน (id="logout-btn")
  useEffect(() => {
    const el = document.getElementById("logout-btn");
    if (!el) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setShowLogoutConfirm(true);
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const t = getCookie("backend-api-token");
    if (!t) return;
    setToken(t);
    fetch("http://localhost:8080/api/listqueue", {
      headers: { Authorization: `Bearer ${t}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) =>
        setCards(data.sort((a: CardItem, b: CardItem) => a.priority - b.priority))
      )
      .catch(console.error);

    Promise.all([
      fetch("http://localhost:8080/api/staffstatus", {
        headers: { Authorization: `Bearer ${t}` },
        credentials: "include",
      }).then((r) => r.json()),
      fetch("http://localhost:8080/api/userstatus", {
        headers: { Authorization: `Bearer ${t}` },
        credentials: "include",
      }).then((r) => r.json()),
      fetch("http://localhost:8080/api/staffstatus/bind", {
        headers: { Authorization: `Bearer ${t}` },
        credentials: "include",
      }).then((r) => r.json()),
      fetch("http://localhost:8080/api/faculty", {
        headers: { Authorization: `Bearer ${t}` },
        credentials: "include",
      }).then((r) => r.json()),
      fetch("http://localhost:8080/api/course/status", {
        headers: { Authorization: `Bearer ${t}` },
        credentials: "include",
      }).then((r) => r.json()),
    ])
      .then(([staffS, userS, bind, fac, course]) => {
        setStaffStatusList(staffS);
        setUserStatusList(userS);
        setStatusMappings(Array.isArray(bind) ? bind : bind.data ?? []);
        setFacultyList(Array.isArray(fac) ? fac : fac.data ?? []);
        setCourseStatusList(Array.isArray(course) ? course : course.data ?? []);
      })
      .catch(console.error);
  }, []);

  function handleSubmitQueue() {
    if (!token) {
      alert("No auth token found.");
      return;
    }
    if (
      !wordfileSubmit ||
      !infoSubmit ||
      !infoSubmit14days ||
      !timeRegister ||
      !onWeb ||
      !appointmentDataAw
    ) {
      alert("กรุณากรอกวันเวลาทุกช่องให้ครบ");
      return;
    }
    const body = {
      id: editingItemId ?? undefined,
      title,
      staff_id: parseInt(staffId),
      faculty,
      staff_status_id: parseInt(staffStatusId),
      wordfile_submit: new Date(wordfileSubmit).toISOString(),
      info_submit: new Date(infoSubmit).toISOString(),
      info_submit_14days: new Date(infoSubmit14days).toISOString(),
      time_register: new Date(timeRegister).toISOString(),
      date_left: Number(dateLeft),
      on_web: new Date(onWeb).toISOString(),
      appointment_data_aw: appointmentDataAw, // ส่ง raw -> แก้ error 500
      course_status_id: parseInt(courseStatusId),
      note,
    };
    const url = "http://localhost:8080/api/listqueue";
    const method = editMode ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`${method} failed: ${res.status} - ${await res.text()}`);
        return res.json();
      })
      .then(async (updatedItem) => {
        setShowSuccess({ mode: editMode ? "edit" : "create" });
        setShowModal(false);
        resetForm();
        if (editMode) {
          if (editingItemId && staffStatusId) {
            await fetch(
              `http://localhost:8080/api/listqueue/${editingItemId}/status/${parseInt(staffStatusId)}`,
              { method: "PUT", headers: { Authorization: `Bearer ${token}` }, credentials: "include" }
            );
          }
          setCards((prev) => prev.map((c) => (c.id === updatedItem.id ? updatedItem : c)));
        } else {
          setCards((prev) => [...prev, updatedItem]);
        }
      })
      .catch((err) => alert(err.message));
  }

  function resetForm() {
    setTitle("");
    setFaculty("");
    setStaffId("");
    setStaffStatusId("");
    setCourseStatusId("");
    setNote("");
    setWordfileSubmit("");
    setInfoSubmit("");
    setInfoSubmit14days("");
    setTimeRegister("");
    setDateLeft(0);
    setOnWeb("");
    setAppointmentDataAw("");
    setEditMode(false);
    setEditingItemId(null);
  }

  function handleEditClick(item: CardItem) {
    setEditMode(true);
    setEditingItemId(item.id);
    setTitle(item.title);
    setFaculty(item.faculty);
    setStaffId(String(item.staff_id));
    setStaffStatusId(String(item.staff_status.id));
    setCourseStatusId(item.course_status_id ? String(item.course_status_id) : "");
    setNote(item.note || "");
    setWordfileSubmit(item.wordfile_submit ? item.wordfile_submit.substring(0, 16) : "");
    setInfoSubmit(item.info_submit ? item.info_submit.substring(0, 16) : "");
    setInfoSubmit14days(item.info_submit_14days ? item.info_submit_14days.substring(0, 16) : "");
    setTimeRegister(item.time_register ? item.time_register.substring(0, 16) : "");
    setDateLeft(item.date_left ?? 0);
    setOnWeb(item.on_web ? item.on_web.substring(0, 16) : "");
    setAppointmentDataAw(toDatetimeLocal(item.appointment_data_aw)); // ให้เข้า format ของ input
    setShowModal(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((i) => i.id === active.id);
      const newIndex = cards.findIndex((i) => i.id === over?.id);
      const newCards = arrayMove(cards, oldIndex, newIndex).map((card, idx) => ({
        ...card,
        priority: idx + 1,
      }));
      setCards(newCards);
      newCards.forEach((card) => {
        fetch(
          `http://localhost:8080/api/listqueue/${card.id}/priority/${card.priority}`,
          { method: "PUT", headers: { Authorization: `Bearer ${token}` }, credentials: "include" }
        );
      });
    }
  }

  function doLogout() {
    clearCookie("backend-api-token");
    window.location.href = "/login";
  }

  return (
    <div className={`${notoSansThai.className} bg-[#F8F4FF] min-h-screen`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#7D3F98]">Queue List</h2>
          <div className="flex items-center gap-3">
            <button
              className="self-start sm:self-auto bg-[#34C759] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md hover:bg-[#28A745] focus:outline-none"
              onClick={() => { resetForm(); setShowModal(true); }}
            >
              + Create Queue
            </button>
          </div>
        </div>

        {/* ---------- Modal ---------- */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 overflow-auto max-h-[90vh] relative">
              <h3 className="text-xl sm:text-2xl font-extrabold text-center text-purple-700 mb-6">
                {editMode ? "Edit Queue" : "Create New Queue"}
              </h3>

              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmitQueue(); }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
              >
                {/* Title */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">Title</span>
                  <input
                    type="text"
                    placeholder="กรอกชื่อเรื่อง"
                    className={inputBase}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>

                {/* Faculty */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">Faculty</span>
                  <select
                    className={selectBase}
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    required
                  >
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
                  <input
                    type="number"
                    placeholder="กรอก Staff ID"
                    className={inputBase}
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                  />
                </label>

                {/* Staff Status */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">Staff Status</span>
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

                {/* Course Status */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">Course Status</span>
                  <select
                    className={selectBase}
                    value={courseStatusId}
                    onChange={(e) => setCourseStatusId(e.target.value)}
                  >
                    <option value="">-- Select Course Status --</option>
                    {courseStatusList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.status}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Wordfile submit */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">วันที่ได้รับไฟล์ Word (wordfile submit)</span>
                  <input
                    type="datetime-local"
                    placeholder="dd/mm/yyyy, --:--"
                    value={wordfileSubmit}
                    onChange={(e) => setWordfileSubmit(e.target.value)}
                    className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
                    required
                  />
                </label>

                {/* Info submit */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">วันที่ได้รับบันทึกข้อความ (info submit)</span>
                  <input
                    type="datetime-local"
                    placeholder="dd/mm/yyyy, --:--"
                    value={infoSubmit}
                    onChange={(e) => setInfoSubmit(e.target.value)}
                    className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
                    required
                  />
                </label>

                {/* Info submit 14 days */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">กรอบเวลา 14 วัน (info submit 14days)</span>
                  <input
                    type="datetime-local"
                    placeholder="dd/mm/yyyy, --:--"
                    value={infoSubmit14days}
                    onChange={(e) => setInfoSubmit14days(e.target.value)}
                    className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
                    required
                  />
                </label>

                {/* Time register */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">วันที่เปิดรับสมัคร (time register)</span>
                  <input
                    type="datetime-local"
                    placeholder="dd/mm/yyyy, --:--"
                    value={timeRegister}
                    onChange={(e) => setTimeRegister(e.target.value)}
                    className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
                    required
                  />
                </label>

                {/* On web */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">วันที่ต้องขึ้นเว็บ (on web)</span>
                  <input
                    type="datetime-local"
                    placeholder="dd/mm/yyyy, --:--"
                    value={onWeb}
                    onChange={(e) => setOnWeb(e.target.value)}
                    className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
                    required
                  />
                </label>

                {/* Appointment (datetime-local) */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">วันที่นัดหมาย (appointment data aw)</span>
                  <input
                    type="datetime-local"
                    placeholder="dd/mm/yyyy, --:--"
                    value={appointmentDataAw}
                    onChange={(e) => setAppointmentDataAw(e.target.value)}
                    className={`${inputBase} [&::-webkit-datetime-edit]:text-gray-400`}
                    required
                  />
                </label>

                {/* Date left */}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">เหลือเวลา (date left) (วัน)</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    className={inputBase}
                    value={dateLeft}
                    onChange={(e) => setDateLeft(Number(e.target.value))}
                  />
                </label>

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
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                  >
                    {editMode ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------- DnD List ---------- */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-4 sm:space-y-6">
              {cards.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEditClick(item)}
                  facultyList={facultyList}
                  courseStatusList={courseStatusList}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* Success overlays (2 วิ) */}
      {showSuccess && (
        <SuccessOverlay
          title="Thank You !"
          message={showSuccess.mode === "edit" ? "Your Edited Successful" : "Your Queue Successful"}
          onClose={() => setShowSuccess(null)}
          autoCloseMs={2000}
        />
      )}

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Logout"
          message="Are you sure you want to log out?"
          confirmText="Yes, Logout"
          cancelText="Cancel"
          onConfirm={doLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}

/* ---------- Sortable Card ---------- */
function SortableCard({
  item,
  onEdit,
  facultyList,
  courseStatusList,
}: {
  item: CardItem;
  onEdit: () => void;
  facultyList: FacultyItem[];
  courseStatusList: CourseStatus[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  const facultyNameTH =
    facultyList.find((f) => String(f.id) === String(item.faculty))?.nameTH || "Unknown Faculty";
  const courseStatusName =
    courseStatusList.find((c) => c.id === item.course_status_id)?.status || "Not Started";

  const mainColor = getStatusColorByName(courseStatusName);
  const containerBgTint = hexToRgba(mainColor, 0.08);
  const badgeFill = hexToRgba(mainColor, 0.3);
  const badgeBorder = mainColor;

  return (
    <li ref={setNodeRef} style={style} {...attributes} className="relative list-none">
      <div className="relative bg-white rounded-3xl w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto p-5 sm:p-7 lg:p-9 shadow-[0_10px_30px_rgba(251,111,146,0.10)]">
        {/* ===== Header (Mobile order: Course Status -> Priority -> Title -> DateLeft) ===== */}
        <div
          className="grid grid-cols-1 md:grid-cols-[max-content_1fr_max-content] items-center gap-2 sm:gap-4 cursor-grab active:cursor-grabbing touch-action-none select-none"
          {...listeners}  // ผูก drag ทั้งหัวบัตร ให้ลากง่ายทุกขนาดจอ
        >
          {/* 1) Course Status / Badge */}
          <div
            className="order-1 md:order-none w-full md:w-auto px-3 py-[6px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap text-center select-none justify-self-start"
            style={{
              border: `3px solid ${badgeBorder}`,
              background: badgeFill,
              color: "#2B2B2B",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
              minWidth: "150px",
            }}
          >
            {courseStatusName}
          </div>

          {/* 2) Priority (mobile only) */}
          <div className="order-2 md:hidden text-center -mt-1">
            <div
              className="text-[44px] leading-none font-extrabold text-transparent bg-clip-text select-none"
              style={{ backgroundImage: getTitleGradient(courseStatusName) }}
            >
              {item.priority ?? 1}
            </div>
          </div>

          {/* 3) Title */}
          <div className="order-3 md:order-none min-w-0 flex md:justify-start justify-center">
            <div
              className="truncate font-extrabold leading-none text-center md:text-left"
              style={{ color: QUEUE_NUMBER_PURPLE, fontSize: "24px", letterSpacing: "0.02em" }}
            >
              {item.title || "title"}
            </div>
          </div>

          {/* 4) Date Left */}
          <div className="order-4 md:order-none justify-self-end">
            <DateLeftCountdown initialDays={item.date_left} colorHex={mainColor} />
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Queue number (desktop only) */}
          <div className="hidden md:flex md:col-span-2 md:items-center justify-center">
            <div
              className="text-[52px] lg:text-[60px] leading-none font-extrabold select-none text-transparent bg-clip-text"
              style={{ backgroundImage: getTitleGradient(courseStatusName) }}
              title="Drag to reorder"
            >
              {item.priority ?? 1}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-6 space-y-4 sm:space-y-5 text-[#4A5568]">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Image src="/Priority.png" alt="Priority" width={16} height={16} className="w-4 h-4" />
              <span className="font-semibold">Priority :</span>
              <span className="ml-8 sm:ml-12">{item.priority ?? "-"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Image src="/Staff ID.png" alt="Staff ID" width={16} height={16} className="w-4 h-4" />
              <span className="font-semibold">Staff ID :</span>
              <span className="ml-8 sm:ml-12">{item.staff_id ?? "-"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Image src="/Faculty.png" alt="Faculty" width={16} height={16} className="w-4 h-4" />
              <span className="font-semibold">Faculty :</span>
              <span className="ml-7 sm:ml-11">{facultyNameTH}</span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Image src="/Staff Status.png" alt="Staff Status" width={16} height={16} className="w-4 h-4" />
              <span className="font-semibold">Staff Status :</span>
              <span className="ml-3">{item.staff_status?.status ?? "-"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Image src="/User Status.png" alt="User Status" width={16} height={16} className="w-4 h-4" />
              <span className="font-semibold">User Status :</span>
              <span className="ml-3">{item.user_status?.status ?? "-"}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-4 w-full">
            {item.note ? (
              <div className="rounded-2xl overflow-hidden bg-white shadow border border-black/5">
                <div className="px-4 py-2.5 font-semibold flex items-center gap-2">
                  <span>📝</span>
                  <span>Notes</span>
                </div>
                <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-700">
                  {item.note}
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* ปุ่มแก้ไข */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 z-20 cursor-pointer rounded-full p-2 hover:bg-black/5 transition"
          title="Edit"
          aria-label="Edit card"
        >
          <Image src="/pencil.png" alt="Edit" width={18} height={18} className="w-[18px] h-[18px] pointer-events-none" />
        </button>

        {/* background tint */}
        <div className="pointer-events-none absolute inset-0 rounded-[22px] sm:rounded-[28px] -z-10" style={{ background: containerBgTint }} />
      </div>
    </li>
  );
}
