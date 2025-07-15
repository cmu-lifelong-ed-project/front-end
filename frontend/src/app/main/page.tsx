"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
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
};

export default function QueuePage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [title, setTitle] = useState("");
  const [faculty, setFaculty] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffStatusId, setStaffStatusId] = useState("");
  const [courseStatusId, setCourseStatusId] = useState("");
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  }

  const token = getCookie("backend-api-token");

  useEffect(() => {
    if (!token) {
      console.error("No backend-api-token cookie found");
      return;
    }
    fetchData();
  }, [token]);

  function fetchData() {
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
        if (!Array.isArray(data)) throw new Error("Invalid data format");
        setCards(data);
      })
      .catch((error) => {
        console.error("Error loading queue:", error);
      });
  }

  function handleAddQueue() {
    if (!token) {
      alert("No auth token found.");
      return;
    }

    const timeNow = new Date().toISOString();

    const body = {
      title: title,
      staff_id: parseInt(staffId),
      faculty: faculty,
      staff_status_id: parseInt(staffStatusId),
      wordfile_submit: timeNow,
      info_submit: timeNow,
      info_submit_14days: timeNow,
      time_register: timeNow,
      date_left: 0,
      on_web: timeNow,
      appointment_data_aw: timeNow,
      course_status_id: parseInt(courseStatusId),
      note: note,
    };

    fetch("http://localhost:8080/api/listqueue", {
      method: "POST",
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
          throw new Error(`Failed to create queue: ${res.status} - ${errorText}`);
        }
        return res.json();
      })
      .then(() => {
        alert("Queue created successfully!");
        setShowModal(false);
        resetForm();
        fetchData();
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
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Queue List</h2>

      {/* ปุ่มเปิด Modal */}
      <button
        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 mb-6"
        onClick={() => setShowModal(true)}
      >
        + Create Queue
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Queue</h3>
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
                <input
                  type="text"
                  className="border rounded px-3 py-2"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
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
                <span className="text-sm font-medium">Staff Status ID</span>
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  value={staffStatusId}
                  onChange={(e) => setStaffStatusId(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Course Status ID</span>
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  value={courseStatusId}
                  onChange={(e) => setCourseStatusId(e.target.value)}
                />
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
                onClick={handleAddQueue}
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

      {/* แสดงรายการ queue */}
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              onClick={() => {}}
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
}: {
  item: CardItem;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      <p className="text-sm text-gray-500">Faculty: {item.faculty}</p>
      <p className="text-sm text-gray-500">
        Status: {item.staff_status.status}
      </p>
    </div>
  );
}
