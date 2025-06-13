"use client";

import "@/app/(main)/style.css";
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
};

function SortableCard({ item }: { item: CardItem }) {
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
    >
      <h3 className="text-lg font-bold">{item.title}</h3>
      <p className="text-sm text-gray-600">Priority: {item.priority}</p>
      <p className="text-sm text-gray-500">Faculty: {item.faculty}</p>
    </div>
  );
}

export default function QueuePage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [title, setTitle] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");

  // next id and priority (start from 1)
  const [nextId, setNextId] = useState<number>(1);
  const [nextPriority, setNextPriority] = useState<number>(1);

  const sensors = useSensors(useSensor(PointerSensor));



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
          // ตั้ง nextId และ nextPriority ให้เป็นค่าต่อไป (สูงสุด + 1)
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
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!faculty.trim()) {
      alert("Please enter a faculty");
      return;
    }

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((item) => item.id === active.id);
      const newIndex = cards.findIndex((item) => item.id === over.id);
      setCards((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
            <SortableCard key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
