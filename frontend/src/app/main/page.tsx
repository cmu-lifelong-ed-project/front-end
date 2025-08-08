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
  wordfile_submit?: string;       // วันที่ได้รับไฟล์ Word
  info_submit?: string;           // วันที่ได้รับบันทึกข้อความ
  info_submit_14days?: string;    // กรอบเวลา 14 วัน
  time_register?: string;         // วันที่เปิดรับสมัคร
  date_left?: number;             // เหลือเวลา (วัน)
  on_web?: string;                // ต้องขึ้นเว็บ
  appointment_data_aw?: string;   // วันที่นัดหมาย
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
  const [faculty, setFaculty] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffStatusId, setStaffStatusId] = useState("");
  const [courseStatusId, setCourseStatusId] = useState("");
  const [note, setNote] = useState("");

  // datetime-local fields (แยกกัน)
  const [wordfileSubmit, setWordfileSubmit] = useState("");
  const [infoSubmit, setInfoSubmit] = useState("");
  const [infoSubmit14days, setInfoSubmit14days] = useState("");
  const [timeRegister, setTimeRegister] = useState("");
  const [dateLeft, setDateLeft] = useState(0);
  const [onWeb, setOnWeb] = useState("");
  const [appointmentDataAw, setAppointmentDataAw] = useState("");

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
    fetchCourseStatus(t);
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
        const sortedData = data.sort((a: CardItem, b: CardItem) => a.priority - b.priority);
        setCards(sortedData);
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
      appointment_data_aw: new Date(appointmentDataAw).toISOString(),
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
    setStaffId(String(item.id));
    setStaffStatusId(String(item.staff_status.id));
    setCourseStatusId(item.course_status_id ? String(item.course_status_id) : "");
    setNote(item.note || "");

    setWordfileSubmit(item.wordfile_submit ? item.wordfile_submit.substring(0, 16) : "");
    setInfoSubmit(item.info_submit ? item.info_submit.substring(0, 16) : "");
    setInfoSubmit14days(item.info_submit_14days ? item.info_submit_14days.substring(0, 16) : "");
    setTimeRegister(item.time_register ? item.time_register.substring(0, 16) : "");
    setDateLeft(item.date_left ?? 0);
    setOnWeb(item.on_web ? item.on_web.substring(0, 16) : "");
    setAppointmentDataAw(item.appointment_data_aw ? item.appointment_data_aw.substring(0, 16) : "");

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Queue List</h2>

      <button
        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 mb-8"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        + Create Queue
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">
                {editMode ? "Edit Queue" : "Create New Queue"}
              </h3>
              <button
                className="text-gray-600 hover:text-gray-900 text-3xl font-bold leading-none"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitQueue();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-auto"
            >
              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Title</span>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Faculty</span>
                <select
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Staff ID</span>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Staff Status</span>
                <select
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Course Status</span>
                <select
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* datetime-local inputs */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">วันที่ได้รับไฟล์ Word (wordfile_submit)</span>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={wordfileSubmit}
                  onChange={(e) => setWordfileSubmit(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">วันที่ได้รับบันทึกข้อความ (info_submit)</span>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={infoSubmit}
                  onChange={(e) => setInfoSubmit(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">กรอบเวลา 14 วัน (info_submit_14days)</span>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={infoSubmit14days}
                  onChange={(e) => setInfoSubmit14days(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">วันที่เปิดรับสมัคร (time_register)</span>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timeRegister}
                  onChange={(e) => setTimeRegister(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">เหลือเวลา (date_left) (วัน)</span>
                <input
                  type="number"
                  min={0}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateLeft}
                  onChange={(e) => setDateLeft(Number(e.target.value))}
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">วันที่ต้องขึ้นเว็บ (on_web)</span>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={onWeb}
                  onChange={(e) => setOnWeb(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">วันที่นัดหมาย (appointment_data_aw)</span>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={appointmentDataAw}
                  onChange={(e) => setAppointmentDataAw(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col md:col-span-2">
                <span className="mb-1 font-medium text-gray-700">Note</span>
                <textarea
                  rows={3}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  {editMode ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-3">
            {cards.map((item) => (
              <SortableCard
                key={item.id}
                item={item}                     // ส่ง object ทั้งก้อน
                onEdit={() => handleEditClick(item)}
                facultyList={facultyList}       // ส่ง list เพื่อช่วยแสดงชื่อ faculty
                courseStatusList={courseStatusList} // ส่ง list เพื่อช่วยแสดงชื่อ course status
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

type SortableCardProps = {
  id: number;
  title: string;
  faculty: string;
  staffStatus: string;
  userStatus: string;
  onEdit: () => void;
};

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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const facultyNameTH =
    facultyList.find((f) => String(f.id) === String(item.faculty))?.nameTH ||
    "Unknown Faculty";

  const courseStatusName =
    courseStatusList.find((c) => c.id === item.course_status_id)?.status ||
    "Unknown Course Status";

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={onEdit}
      className="bg-white rounded p-4 shadow cursor-grab flex flex-col select-none"
      title="Double click to edit"
    >
      <h4 className="font-semibold text-lg">{item.title}</h4>
      <p className="text-sm text-gray-600">Priority: {item.priority}</p>
      <p className="text-sm text-gray-500">Faculty: {facultyNameTH}</p>
      <p className="text-sm text-gray-500">Staff Status: {item.staff_status.status}</p>
      <p className="text-sm text-gray-500">User Status: {item.user_status.status}</p>
      <p className="text-sm text-gray-500">Course Status: {courseStatusName}</p>
       <p className="text-sm text-gray-500">Date Left: {item.date_left ?? 0} วัน</p>
        {item.note && <p className="text-sm text-gray-500 italic">Note: {item.note}</p>}
    </li>
  );
}



