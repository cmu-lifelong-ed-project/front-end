"use client";
import "@/app/(main)/style.css";
import React, { useState } from "react";
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
  uid: number;
  title: string;
  description: string;
};

export default function QueueCardPage() {
  const [queue, setQueue] = useState<CardItem[]>([
    { uid: 101, title: "คำร้องขอที่ 1", description: "รายละเอียดของคำร้องขอที่ 1" },
    { uid: 102, title: "คำร้องขอที่ 2", description: "รายละเอียดของคำร้องขอที่ 2" },
    { uid: 103, title: "คำร้องขอที่ 3", description: "รายละเอียดของคำร้องขอที่ 3" },
  ]);

  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [newCard, setNewCard] = useState<CardItem>({ uid: 0, title: "", description: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = queue.findIndex((item) => item.uid === active.id);
      const newIndex = queue.findIndex((item) => item.uid === over.id);
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      setQueue(newQueue);
    }
  };

  const handleCardClick = (card: CardItem) => {
    setSelectedCard(card);
  };

  const handleSave = () => {
    if (!selectedCard) return;
    setQueue((prev) =>
      prev.map((c) => (c.uid === selectedCard.uid ? selectedCard : c))
    );
    setSelectedCard(null);
  };

  const handleAddNewCard = () => {
    if (!newCard.title.trim()) return;
    const newUid = Math.max(...queue.map((c) => c.uid), 100) + 1;
    setQueue((prev) => [...prev, { ...newCard, uid: newUid }]);
    setNewCard({ uid: 0, title: "", description: "" });
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto pt-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">รายการคำร้อง (Queue)</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={queue.map((item) => item.uid)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {queue.map((card, index) => (
              <SortableCard
                key={card.uid}
                card={card}
                displayNumber={index + 1}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-6"
        >
          ➕ เพิ่มคำร้องใหม่
        </button>
      </div>

      {/* Modal แก้ไขคำร้อง */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">แก้ไขคำร้อง</h2>
            <label className="block text-sm font-medium text-gray-700">หัวข้อ</label>
            <input
              type="text"
              value={selectedCard.title}
              onChange={(e) =>
                setSelectedCard({ ...selectedCard, title: e.target.value })
              }
              className="w-full p-2 border rounded-md mb-4"
            />
            <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
            <textarea
              value={selectedCard.description}
              onChange={(e) =>
                setSelectedCard({ ...selectedCard, description: e.target.value })
              }
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มคำร้องใหม่ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-green-600">เพิ่มคำร้องใหม่</h2>
            <label className="block text-sm font-medium text-gray-700">หัวข้อ</label>
            <input
              type="text"
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
              className="w-full p-2 border rounded-md mb-4"
            />
            <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
            <textarea
              value={newCard.description}
              onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddNewCard}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableCard({
  card,
  displayNumber,
  onClick,
}: {
  card: CardItem;
  displayNumber: number;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.uid,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 10ms ease-in-out",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="transition-transform duration-300 ease-in-out flex items-start gap-6 p-6 bg-gray-100 rounded-2xl shadow-sm border hover:shadow-md"
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white cursor-grab select-none"
        title="ลากเพื่อจัดลำดับ"
      >
        {displayNumber}
      </div>

      {/* Click area */}
      <div onClick={onClick} className="flex-1 cursor-pointer">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">{card.title}</h2>
        <p className="text-gray-600">{card.description}</p>
      </div>
    </div>
  );
}
