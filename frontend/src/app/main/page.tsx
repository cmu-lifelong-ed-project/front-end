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

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";


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
  appointment_date_aw?: string;   // วันที่นัดหมาย
  order_mappings?: Order_Mappings[];   
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

type OrderItem = {
  id: number;
  title: string;
  checked: boolean; 
};


type Order_Mappings = {
  id: number;
  order_id: number;
  listqueue_id: number;
  checked: boolean | number | string;
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
  const [appointmentDateAw, setAppointmentDateAw] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [token, setToken] = useState("");

  const [orders, setOrders] = useState<OrderItem[]>([]);
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
          console.log("listqueue data", data);
          const sortedData = data.sort(
            (a: CardItem, b: CardItem) => a.priority - b.priority
          );
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
      !appointmentDateAw
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
      appointment_date_aw: new Date(appointmentDateAw).toISOString(),
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

 


      function toBool(v: any): boolean {
        if (typeof v === "boolean") return v;
        if (typeof v === "number") return v === 1;
        if (typeof v === "string") {
          const s = v.trim().toLowerCase();
          return s === "true" || s === "1";
        }
        return false;
      }



  async function fetchOrders(listQueueId: number) {
    if (!token) return;
    fetch(`http://localhost:8080/api/order/${listQueueId}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(
          (Array.isArray(data) ? data : []).map((o: any) => ({
            id: Number(o.id),
            title: o.title || `Order ${o.id}`,
            checked: toBool(o.checked),
          }))
        );
      })
      .catch(console.error);
  }


useEffect(() => {
  if (showModal && editMode && editingItemId != null) {
    fetchOrders(editingItemId);
  }
}, [showModal, editMode, editingItemId, token]);


function handleToggleOrder(order_id: number, checked: boolean) {
    setOrders((prev) => prev.map((o) => (o.id === order_id ? { ...o, checked } : o)));

    fetch("http://localhost:8080/api/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ list_queue_id: editingItemId, order_id, checked }),
    }).catch(console.error);
  }


   function mergeOrdersWithMapping(orders: OrderItem[], mappings: Order_Mappings[]): OrderItem[] {
  return orders.map((o) => {
    // หา mapping ของ order นี้
    const mapping = mappings.find((m) => m.order_id === o.id);
    return {
      ...o,
      checked: mapping ? toBool(mapping.checked) : false, // ใช้ฟังก์ชันแปลง boolean
    };
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
    setAppointmentDateAw("");
    setEditMode(false);
    setEditingItemId(null);
    setOrders([])
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
    setAppointmentDateAw(item.appointment_date_aw ? item.appointment_date_aw.substring(0, 16) : "");
    if (item.order_mappings) {
        setOrders(mergeOrdersWithMapping(orders, item.order_mappings));
      } else {
        setOrders(orders.map(o => ({ ...o, checked: false })));
      }


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
<div className="bg-[#F8F4FF] p-6 min-h-screen">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 overflow-auto max-h-[90vh] relative">
        <h3 className="text-2xl font-extrabold text-center text-purple-700 mb-6">
          {editMode ? "Edit Queue" : "Create New Queue"}
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitQueue();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title</span>
            <input
              type="text"
              className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {/* Faculty */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Faculty</span>
            <select
              className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
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
              className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
          </label>

          {/* Staff Status */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Staff Status</span>
            <select
              className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
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

          {/* DateTime Inputs */}
         {[
                { label: "วันที่ได้รับไฟล์ Word (wordfile_submit)", value: wordfileSubmit, setter: setWordfileSubmit },
                { label: "วันที่ได้รับบันทึกข้อความ (info_submit)", value: infoSubmit, setter: setInfoSubmit },
                { label: "กรอบเวลา 14 วัน (info_submit_14days)", value: infoSubmit14days, setter: setInfoSubmit14days },
                { label: "วันที่เปิดรับสมัคร (time_register)", value: timeRegister, setter: setTimeRegister },
                { label: "วันที่ต้องขึ้นเว็บ (on_web)", value: onWeb, setter: setOnWeb },
                { label: "วันที่นัดหมาย (appointment_date_aw)", value: appointmentDateAw, setter: setAppointmentDateAw },
              ].map((field, idx) => (
                <label key={idx} className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{field.label}</span>
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.setter(date ? dayjs(date).format("YYYY-MM-DDTHH:mm") : "")}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="dd/MM/yyyy HH:mm" // แสดงวัน/เดือน/ปี
                    className="rounded-full px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm w-full"
                  />
                </label>
              ))}
          {/* Note */}
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold">Note</span>
            <textarea
              rows={3}
              className="rounded-2xl px-4 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

        <div className="md:col-span-2">
                <span className="text-sm font-semibold block mb-2">Orders</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {orders.map((order) => (
                    <label key={`order-${order.id}`} className="flex items-center gap-2 border p-2 rounded">
                      <input type="checkbox" checked={order.checked} onChange={(e) => handleToggleOrder(order.id, e.target.checked)} />
                      <span>{order.id}</span>
                      <span>{order.title}</span>
                    </label>
                  ))}
                </div>
              </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-semibold"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              {editMode ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
      {cards.map((item) => (
        <SortableCard
          key={item.id}
          item={item}
          onEdit={() => handleEditClick(item)}
          facultyList={facultyList}
          courseStatusList={courseStatusList}
        />
      ))}
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
      className="p-6 bg-white rounded-[30px] shadow mb-4 cursor-pointer hover:bg-gray-50"
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



