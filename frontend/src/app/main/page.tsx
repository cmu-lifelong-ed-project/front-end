"use client";
import React, { useEffect, useState } from "react";
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

type CardItem = {
  id: number;
  priority: number;
  title: string;
  faculty: string;
  staff_status: {
    id: number;
    status: string;
  };
  user_status: {
    id: number;
    status: string;
  };
  course_status_id?: number; 
  note?: string;
};

type StaffStatus = {
  id: number;
  status: string;
  type: string;
};

type UserStatus = {
  id: number;
  status: string;
  type: string;
};

type StatusMapping = {
  staff_status_id: number;
  user_status_id: number;
};

type FacultyItem = {
  id: number;
  code: string;
  nameTH: string;
  nameEN: string;
};

type CourseStatus = {
  id: number;
  status: string;
  type: string;
};

export default function QueuePage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [title, setTitle] = useState("");
  const [faculty, setFaculty] = useState(""); // เก็บ faculty id เป็น string
  const [staffId, setStaffId] = useState("");
  const [staffStatusId, setStaffStatusId] = useState("");
  const [courseStatusId, setCourseStatusId] = useState(""); // เก็บ course status id
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [token, setToken] = useState("");

  
  const [staffStatusList, setStaffStatusList] = useState<StaffStatus[]>([]);
  const [userStatusList, setUserStatusList] = useState<UserStatus[]>([]);
  const [statusMappings, setStatusMappings] = useState<StatusMapping[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [courseStatusList, setCourseStatusList] = useState<CourseStatus[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  function getCookie(name: string) {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  }

  useEffect(() => {
    const t = getCookie("backend-api-token");
    if (!t) {
      console.error("No backend-api-token cookie found");
      return;
    }
    setToken(t);
    fetchData(t);
    fetchStatuses(t);
    fetchFaculty(t);
    fetchCourseStatus(t); // ดึง course status
  }, []);

  function fetchData(token: string) {
    fetch("http://localhost:8080/api/listqueue", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listqueue");
        return res.json();
      })
      .then((data) => {
        setCards(data);
      })
      .catch((error) => {
        console.error("Error loading queue:", error);
      });
  }

  function fetchStatuses(token: string) {
    Promise.all([
      fetch("http://localhost:8080/api/staffstatus", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).then((res) => res.json()),
      fetch("http://localhost:8080/api/userstatus", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).then((res) => res.json()),
      fetch("http://localhost:8080/api/staffstatus/bind", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).then((res) => res.json()),
    ])
      .then(([staffStatuses, userStatuses, mappingsResponse]) => {
        setStaffStatusList(staffStatuses);
        setUserStatusList(userStatuses);

        if (Array.isArray(mappingsResponse)) {
          setStatusMappings(mappingsResponse);
        } else if (mappingsResponse.data && Array.isArray(mappingsResponse.data)) {
          setStatusMappings(mappingsResponse.data);
        } else {
          setStatusMappings([]);
          console.warn("statusMappings ไม่ใช่ array", mappingsResponse);
        }
      })
      .catch((e) => console.error("Error loading statuses/mappings", e));
  }

  function fetchFaculty(token: string) {
    fetch("http://localhost:8080/api/faculty", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFacultyList(data);
        } else if (data.data && Array.isArray(data.data)) {
          setFacultyList(data.data);
        } else {
          console.warn("Invalid faculty response:", data);
          setFacultyList([]);
        }
      })
      .catch((e) => console.error("Error fetching faculty list:", e));
  }

  function fetchCourseStatus(token: string) {
    fetch("http://localhost:8080/api/course/status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourseStatusList(data);
        } else if (data.data && Array.isArray(data.data)) {
          setCourseStatusList(data.data);
        } else {
          console.warn("Invalid course status response:", data);
          setCourseStatusList([]);
        }
      })
      .catch((e) => console.error("Error fetching course status:", e));
  }

  function getUserStatusByStaffStatusId(staffStatusId: number): string {
    const mapping = statusMappings.find((m) => m.staff_status_id === staffStatusId);
    if (!mapping) return "Unknown";

    const userStatus = userStatusList.find((u) => u.id === mapping.user_status_id);
    return userStatus?.status || "Unknown";
  }

  async function updateStaffStatus(id: number, staff_status_id: number) {
    await fetch(
      `http://localhost:8080/api/listqueue/${id}/status/${staff_status_id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }
    );
  }

  function handleSubmitQueue() {
    if (!token) {
      alert("No auth token found.");
      return;
    }

    const timeNow = new Date().toISOString();

    const body = {
      id: editingItemId ?? undefined,
      title,
      staff_id: parseInt(staffId),
      faculty, // ส่ง faculty id
      staff_status_id: parseInt(staffStatusId),
      wordfile_submit: timeNow,
      info_submit: timeNow,
      info_submit_14days: timeNow,
      time_register: timeNow,
      date_left: 0,
      on_web: timeNow,
      appointment_data_aw: timeNow,
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
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`${method} failed: ${res.status} - ${errorText}`);
        }
        return res.json();
      })
      .then(async (updatedItem) => {
        alert(`${editMode ? "Edited" : "Created"} successfully!`);
        setShowModal(false);
        resetForm();

        if (editMode) {
          if (editingItemId && staffStatusId) {
            await updateStaffStatus(editingItemId, parseInt(staffStatusId));
          }

          setCards((prevCards) =>
            prevCards.map((card) => (card.id === updatedItem.id ? updatedItem : card))
          );
        } else {
          setCards((prevCards) => [...prevCards, updatedItem]);
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  function resetForm() {
    setTitle("");
    setFaculty("");
    setStaffId("");
    setStaffStatusId("");
    setCourseStatusId("");
    setNote("");
    setEditMode(false);
    setEditingItemId(null);
  }

  function handleEditClick(item: CardItem) {
    setEditMode(true);
    setEditingItemId(item.id);
    setTitle(item.title);
    setFaculty(item.faculty); // สมมุติว่าเป็น faculty id
    setStaffId(String(item.id));
    setStaffStatusId(String(item.staff_status.id));
    setCourseStatusId(item.course_status_id ? String(item.course_status_id) : "");
    setNote(item.note || "");
    setShowModal(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((item) => item.id === active.id);
      const newIndex = cards.findIndex((item) => item.id === over?.id);
      const newCards = arrayMove(cards, oldIndex, newIndex);

      const updated = newCards.map((card, index) => ({
        ...card,
        priority: index + 1,
      }));

      setCards(updated);

      updated.forEach((card) => {
        fetch(
          `http://localhost:8080/api/listqueue/${card.id}/priority/${card.priority}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
      });
    }
  }

  return (
<div className="bg-[#F8F4FF] p-6">
<h2 className="text-2xl font-bold mb-4 text-[#7D3F98]">Queue List</h2>
  <button
    className="bg-[#34C759] text-white px-6 py-3 rounded-full shadow-md hover:bg-[#28A745] focus:outline-none mb-6"
    onClick={() => {
      resetForm();
      setShowModal(true);
    }}
  >
    + Create Queue
  </button>

      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative">
      <h3 className="text-2xl font-extrabold text-center text-purple-700 mb-6">
        {editMode ? "Edit Queue" : "Create New Queue"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Title</span>
          <input
            type="text"
            className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        {/* Faculty */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Faculty</span>
          <select
            className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
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
            className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />
        </label>

        {/* Staff Status */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Staff Status</span>
          <select
            className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            value={staffStatusId}
            onChange={(e) => setStaffStatusId(e.target.value)}
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
            className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
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

        {/* Note */}
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-semibold">Note</span>
          <textarea
            rows={4}
            className="rounded-2xl px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          disabled={
            title.trim() === "" ||
            faculty.trim() === "" ||
            staffId.trim() === "" ||
            staffStatusId.trim() === "" ||
            courseStatusId.trim() === ""
          }
          onClick={handleSubmitQueue}
          className={`px-6 py-2 rounded-full text-white text-sm font-semibold transition-colors duration-200 ${
            title.trim() &&
            faculty.trim() &&
            staffId.trim() &&
            staffStatusId.trim() &&
            courseStatusId.trim()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Submit
        </button>

        <button
          type="button"
          className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

#123
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              onClick={() => handleEditClick(item)}
              getUserStatusByStaffStatusId={getUserStatusByStaffStatusId}
              facultyList={facultyList}
              courseStatusList={courseStatusList}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableCard({
  item,
  onClick,
  getUserStatusByStaffStatusId,
  facultyList,
  courseStatusList,
}: {
  item: CardItem;
  onClick: () => void;
  getUserStatusByStaffStatusId: (staffStatusId: number) => string;
  facultyList: FacultyItem[];
  courseStatusList: CourseStatus[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const facultyNameTH = facultyList.find((f) => String(f.id) === String(item.faculty))?.nameTH || "Unknown Faculty";
  const courseStatusName = courseStatusList.find((c) => c.id === item.course_status_id)?.status || "Unknown Course Status";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-6 bg-white rounded-[30px] shadow mb-4 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <h3 className="text-lg font-bold text-[#7C36A7] ">{item.title}</h3>
      <p className="text-sm font-extrabold text-gray-600">Priority: <span className="font-normal">{item.priority}</span></p>
      <p className="text-sm font-extrabold text-gray-500">Faculty: <span className="font-normal">{facultyNameTH}</span></p>
      <p className="text-sm font-extrabold text-gray-500">Staff Status: <span className="font-normal">{item.staff_status.status}</span></p>  
      <p className="text-sm font-extrabold text-gray-500">Course Status: <span className="font-normal">{courseStatusName}</span></p>
      {item.note && <p className="text-sm font-extrabold text-gray-500 italic">Note: <span className="font-normal">{item.note}</span></p>}
    </div>
  );
}
