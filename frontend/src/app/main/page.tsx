"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Noto_Sans_Thai } from "next/font/google";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import SortableCard from "@/components/SortableCard";
import QueueModal from "../../components/QueueModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SuccessOverlay from "@/components/ui/SuccessOverlay";


import {
  CardItem, CourseStatus, FacultyItem, OrderMapping, StaffStatus, UserStatus,
} from "../../types/queue";
import { toDatetimeLocal } from "@/lib/ui";

const notoSansThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  display: "swap",
});

export default function QueuePage() {
  const [cards, setCards] = useState<CardItem[]>([]);

  // form states
  const [title, setTitle] = useState("");
  const [faculty, setFaculty] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffStatusId, setStaffStatusId] = useState("");
  const [courseStatusId, setCourseStatusId] = useState("");
  const [note, setNote] = useState("");

  const [wordfileSubmit, setWordfileSubmit] = useState("");
  const [infoSubmit, setInfoSubmit] = useState("");
  const [infoSubmit14days, setInfoSubmit14days] = useState("");
  const [timeRegister, setTimeRegister] = useState("");
  const [dateLeft, setDateLeft] = useState(0);
  const [onWeb, setOnWeb] = useState("");
  const [appointmentDateAw, setAppointmentDateAw] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [token, setToken] = useState("");

  const [staffStatusList, setStaffStatusList] = useState<StaffStatus[]>([]);
  const [userStatusList, setUserStatusList] = useState<UserStatus[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [courseStatusList, setCourseStatusList] = useState<CourseStatus[]>([]);

  const [showSuccess, setShowSuccess] = useState<null | { mode: "create" | "edit" }>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [orderMappings, setOrderMappings] = useState<OrderMapping[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // drag sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

  // bind logout red button (id="logout-btn")
  useEffect(() => {
    const el = document.getElementById("logout-btn");
    if (!el) return;
    const handler = (e: Event) => { e.preventDefault(); setShowLogoutConfirm(true); };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, []);

  // fetch data
  useEffect(() => {
    const t = getCookie("backend-api-token");
    if (!t) return;
    setToken(t);

    fetch("http://localhost:8080/api/listqueue", {
      headers: { Authorization: `Bearer ${t}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setCards((data || []).sort((a: CardItem, b: CardItem) => a.priority - b.priority)))
      .catch(console.error);

    Promise.all([
      fetch("http://localhost:8080/api/staffstatus", { headers: { Authorization: `Bearer ${t}` }, credentials: "include" }).then((r) => r.json()),
      fetch("http://localhost:8080/api/userstatus", { headers: { Authorization: `Bearer ${t}` }, credentials: "include" }).then((r) => r.json()),
      fetch("http://localhost:8080/api/faculty", { headers: { Authorization: `Bearer ${t}` }, credentials: "include" }).then((r) => r.json()),
      fetch("http://localhost:8080/api/course/status", { headers: { Authorization: `Bearer ${t}` }, credentials: "include" }).then((r) => r.json()),
    ])
      .then(([staffS, userS, fac, course]) => {
        setStaffStatusList(staffS);
        setUserStatusList(userS);
        setFacultyList(Array.isArray(fac) ? fac : fac.data ?? []);
        setCourseStatusList(Array.isArray(course) ? course : course.data ?? []);
      })
      .catch(console.error);
  }, []);

  function handleSubmitQueue() {
    if (!token) { alert("No auth token found."); return; }
    if (!wordfileSubmit || !infoSubmit || !infoSubmit14days || !timeRegister || !onWeb || !appointmentDateAw) {
      alert("กรุณากรอกวันเวลาทุกช่องให้ครบ"); return;
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
      appointment_date_aw: new Date(appointmentDateAw).toISOString(),
      course_status_id: parseInt(courseStatusId),
      note,
    };
    const url = "http://localhost:8080/api/listqueue";
    const method = editMode ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${method} failed: ${res.status} - ${await res.text()}`);
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
    setAppointmentDateAw("");
    setEditMode(false);
    setEditingItemId(null);
    setOrderMappings([]);
    setCurrentId(null);
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
    setAppointmentDateAw(toDatetimeLocal(item.appointment_date_aw));
    setShowModal(true);
    setOrderMappings(item.order_mappings || []);
    setCurrentId(item.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cards.findIndex((i) => i.id === active.id);
    const newIndex = cards.findIndex((i) => i.id === over.id);
    const newCards = arrayMove(cards, oldIndex, newIndex).map((card, idx) => ({ ...card, priority: idx + 1 }));
    setCards(newCards);
    newCards.forEach((card) => {
      fetch(`http://localhost:8080/api/listqueue/${card.id}/priority/${card.priority}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
    });
  }

  async function handleToggleOrder(listQueueId: number, orderId: number, checked: boolean) {
    if (!token) return;
    try {
      await fetch("http://localhost:8080/api/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId, list_queue_id: listQueueId, checked }),
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
      alert("Update order failed");
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

        {/* Modal */}
        <QueueModal
          isOpen={showModal}
          editMode={editMode}
          title={title} setTitle={setTitle}
          faculty={faculty} setFaculty={setFaculty}
          staffId={staffId} setStaffId={setStaffId}
          staffStatusId={staffStatusId} setStaffStatusId={setStaffStatusId}
          courseStatusId={courseStatusId} setCourseStatusId={setCourseStatusId}
          wordfileSubmit={wordfileSubmit} setWordfileSubmit={setWordfileSubmit}
          infoSubmit={infoSubmit} setInfoSubmit={setInfoSubmit}
          infoSubmit14days={infoSubmit14days} setInfoSubmit14days={setInfoSubmit14days}
          timeRegister={timeRegister} setTimeRegister={setTimeRegister}
          onWeb={onWeb} setOnWeb={setOnWeb}
          appointmentDateAw={appointmentDateAw} setAppointmentDateAw={setAppointmentDateAw}
          dateLeft={dateLeft} setDateLeft={setDateLeft}
          note={note} setNote={setNote}
          facultyList={facultyList}
          courseStatusList={courseStatusList}
          staffStatusList={staffStatusList}
          onSubmit={handleSubmitQueue}
          onClose={() => setShowModal(false)}
          orderMappings={orderMappings}
          setOrderMappings={setOrderMappings}
          currentId={currentId}
          onToggleOrder={handleToggleOrder}
          token={token}
        />

        {/* List + DnD */}
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

      {/* success banner */}
      {showSuccess && (
        <SuccessOverlay
          title="Thank You !"
          message={showSuccess.mode === "edit" ? "Your Edited Successful" : "Your Queue Successful"}
          onClose={() => setShowSuccess(null)}
          autoCloseMs={2000}
        />
      )}

      {/* confirm logout */}
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
