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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Queue List</h2>

      <button
        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 mb-6"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        + Create Queue
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editMode ? "Edit Queue" : "Create New Queue"}</h3>
              <button
                className="text-gray-600 hover:text-gray-800 text-xl"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium">Title</span>
                <input
                  type="text"
                  className="border rounded px-3 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Faculty</span>
                <select
                  className="border rounded px-3 py-2"
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

              <label className="flex flex-col">
                <span className="text-sm font-medium">Staff ID</span>
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Staff Status</span>
                <select
                  className="border rounded px-3 py-2"
                  value={staffStatusId}
                  onChange={(e) => setStaffStatusId(e.target.value)}
                >
                  <option value="">-- Select status --</option>
                  {staffStatusList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Course Status</span>
                <select
                  className="border rounded px-3 py-2"
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

              <label className="flex flex-col md:col-span-2">
                <span className="text-sm font-medium">Note</span>
                <textarea
                  className="border rounded px-3 py-2"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmitQueue}
              >
                Submit
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
      className="p-4 bg-white rounded shadow mb-2 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <h3 className="text-lg font-bold">{item.title}</h3>
      <p className="text-sm text-gray-600">Priority: {item.priority}</p>
      <p className="text-sm text-gray-500">Faculty: {facultyNameTH}</p>
      <p className="text-sm text-gray-500">Staff Status: {item.staff_status.status}</p>
      <p className="text-sm text-gray-500">User Status: {item.user_status.status}</p>
      <p className="text-sm text-gray-500">Course Status: {courseStatusName}</p>
      {item.note && <p className="text-sm text-gray-500 italic">Note: {item.note}</p>}
    </div>
  );
}
