"use client";
import "./style.css"
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
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

type StatusItem = {
  id: number;
  status: string;
};

function SortableCard({
  item,
  onClick,
}: {
  item: CardItem;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

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
      className="p-4 bg-white rounded shadow mb-2 cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-lg font-bold">{item.title}</h3>
      <p className="text-sm text-gray-600">Priority: {item.priority}</p>
      <p className="text-sm text-gray-500">Faculty: {item.faculty}</p>
      <p className="text-sm text-gray-500">Status: {item.staff_status.id  }</p>
    </div>
  );
}

function EditModal({
  item,
  onClose,
  onSave,
  onChange,
  statusList,
}: {
  item: CardItem;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof CardItem, value: any) => void;
  statusList: StatusItem[];
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit</h2>

        <div>
          <p className="text-lg">หลักสูตร</p>
          <input
            className="border p-2 w-full mb-3"
            value={item.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Title"
          />
        </div>

        <div>
          <p>ส่วนงาน</p>
          <input
            className="border p-2 w-full mb-4"
            value={item.faculty}
            onChange={(e) => onChange("faculty", e.target.value)}
            placeholder="Faculty"
          />
        </div>

        <div>
          <p>Status การทำงาน</p>
          <select
            className="border p-2 w-full mb-4"
            value={item.staff_status?.id ?? ""}
            onChange={(e) =>
              onChange("staff_status", {
                id: parseInt(e.target.value),
                status:
                  statusList.find((s) => s.id === parseInt(e.target.value))
                    ?.status ?? "",
              })
            }
          >
            <option value="">-- เลือกสถานะ --</option>
            {statusList.map((status) => (
              <option key={status.id} value={status.id}>
                {status.status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


export default function QueuePage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [title, setTitle] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [nextId, setNextId] = useState<number>(1);
  const [nextPriority, setNextPriority] = useState<number>(1);
  const [editingItem, setEditingItem] = useState<CardItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const [statusList, setStatusList] = useState<{ id: number; status: string }[]>([]);


useEffect(() => {
  fetch("http://localhost:8080/api/listqueue/")
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        const mappedStatusList = data.map((item: { id: number; status: string }) => ({
          id: item.id,
          status: item.status, 
        }));
        setStatusList(mappedStatusList); 
      }
    })
    .catch((err) => console.error("Failed to fetch status list", err));
}, []);
  useEffect(() => {
    fetch("http://localhost:8080/api/listqueue")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (
          Array.isArray(data) &&
          data.every(
            (item) =>
              typeof item.id === "number" &&
              typeof item.priority === "number" &&
              typeof item.title === "string" &&
              typeof item.faculty === "string"
              

          )
        ) {
          setCards(data);
          const maxId = Math.max(...data.map((d) => d.id), 0);
          const maxPriority = Math.max(...data.map((d) => d.priority), 0);
          setNextId(maxId + 1);
          setNextPriority(maxPriority + 1);
        } else {
          console.error("Data format invalid:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch queue:", err));
  }, []);

  const handleAddQueue = () => {
    if (!title.trim()) return alert("Please enter a title");
    if (!faculty.trim()) return alert("Please enter a faculty");

    const newQueue = {
      id: nextId,
      priority: nextPriority,
      title,
      faculty,
    };

    fetch("http://localhost:8080/api/listqueue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newQueue),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add queue");
        return res.json();
      })
      .then((data: CardItem) => {
        setCards((prev) => [...prev, data]);
        setNextId((id) => id + 1);
        setNextPriority((p) => p + 1);
        setTitle("");
        setFaculty("");
      })
      .catch((err) => console.error("Failed to add queue:", err));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    fetch(`http://localhost:8080/api/listqueue/${editingItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((updated: CardItem) => {
        setCards((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setEditingItem(null);
      })
      .catch((err) => console.error("Update error:", err));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((item) => item.id === active.id);
      const newIndex = cards.findIndex((item) => item.id === over.id);
      setCards((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-4">Queue Management</h1>

      <div className="mb-6 grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Title"
          className="border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Faculty"
          className="border p-2"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
        />
      </div>

      <button
        onClick={handleAddQueue}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Add Queue
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              onClick={() => setEditingItem({ ...item })}
            />
          ))}
        </SortableContext>
      </DndContext>

    {editingItem && (
        <EditModal
            item={editingItem}
            statusList={statusList} 
            onClose={() => setEditingItem(null)}
            onSave={handleSaveEdit}
            onChange={(field, value) =>
              setEditingItem((prev) =>
                prev ? { ...prev, [field]: value } : prev
              )
            }
          />
        )}

      </div>
  );
}
