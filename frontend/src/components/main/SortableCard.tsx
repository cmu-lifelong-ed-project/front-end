"use client";
import React from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DateLeftCountdown from "./DateLeftCountdown";
import { ListQueue } from "@/types/api/queue";
import {
  getStatusColorByName,
  hexToRgba,
  QUEUE_NUMBER_PURPLE,
  getProgressColor,
} from "../../lib/ui";

interface SortableCardProps {
  item: ListQueue;
  onEdit: () => void;
  progressDone?: number;
  progressTotal?: number;
  token: string;
  canDrag: boolean; // รับ prop จาก QueuePage
  role: string;
}

export default function SortableCard({
  item,
  onEdit,
  progressDone = 0,
  progressTotal = 0,
  canDrag,
  role,
}: SortableCardProps) {
  const percent = Math.max(
    0,
    Math.min(
      100,
      progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0
    )
  );

  // ใช้ canDrag เพื่อเปิด/ปิด drag
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
      disabled: !canDrag,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const courseStatusName = item.course_status.status || "Not Started";
  const staffName =
    `${item.staff.firstname_th} ${item.staff.lastname_th}` || "-";
  const facultyNameTH = item.faculty.nameTH || "-";
  const staffStatusName = item.staff_status?.status || "-";

  const mainColor = getStatusColorByName(courseStatusName);
  const containerBgTint = hexToRgba(mainColor, 0.08);
  const badgeFill = hexToRgba(mainColor, 0.3);
  const badgeBorder = mainColor;
  const barColorClass = getProgressColor(percent);

  const canSeeStaff = role === "admin" || role === "staff" || role === "LE";
  const canSeeStaffStatus = role === "admin" || role === "staff";
  const canSeeNote = role === "admin" || role === "staff";
  const canSeeDateLeft = role === "admin" || role === "staff";

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canDrag ? listeners : {})}
      className="relative list-none"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto p-5 sm:p-7 lg:p-9 shadow-[0_10px_30px_rgba(251,111,146,0.10)]">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-[max-content_1fr_max-content] items-center gap-2 sm:gap-4 cursor-grab active:cursor-grabbing touch-action-none select-none">
          <div
            className="w-full md:w-auto px-3 py-[6px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap text-center select-none justify-self-start"
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

          <div className="md:hidden text-center -mt-1">
            <div
              className="text-[44px] leading-none font-extrabold text-transparent bg-clip-text select-none"
              style={{ color: QUEUE_NUMBER_PURPLE }}
            >
              {item.priority ?? 1}
            </div>
          </div>

          <div className="min-w-0 flex md:justify-start justify-center">
            <div
              className="truncate font-extrabold leading-none text-center md:text-left"
              style={{
                color: QUEUE_NUMBER_PURPLE,
                fontSize: "24px",
                letterSpacing: "0.02em",
              }}
            >
              {item.title || "title"}
            </div>
          </div>

          {canSeeDateLeft && item.on_web && (
            <div className="justify-self-end">
              <DateLeftCountdown
                deadlineISO={item.on_web}
                colorHex={mainColor}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          <div className="hidden md:flex md:col-span-2 md:items-center justify-center">
            <div
              className="text-[52px] lg:text-[60px] leading-none font-extrabold select-none"
              style={{ color: QUEUE_NUMBER_PURPLE }}
              title="Drag to reorder"
            >
              {item.priority ?? 1}
            </div>
          </div>

          <div className="md:col-span-5 space-y-2 sm:space-y-3 text-[#4A5568]">
            <div className="mb-10">
              <div className="text-[11px] sm:text-xs text-gray-500">
                ความคืบหน้า
              </div>
              <div className="text-sm sm:text-base font-semibold">
                <span className="text-[#6C63FF]">{percent}%</span>
                <span className="text-gray-500 ml-2">ดำเนินการแล้ว</span>
              </div>
              <div className="mt-2 relative h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${barColorClass}`}
                  style={{ width: `${percent}%` }}
                />
                {[25, 50, 75].map((m) => (
                  <span
                    key={m}
                    className={`absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${
                      percent >= m ? "bg-white" : "bg-gray-400"
                    }`}
                    style={{ left: `calc(${m}% - 3px)` }}
                  />
                ))}
              </div>
            </div>

            {canSeeStaff && (
              <Line
                icon="/Staff ID.png"
                label="รหัสประจำตัวเจ้าหน้าที่"
                value={staffName}
              />
            )}
            <Line
              icon="/Faculty.png"
              label="คณะ"
              value={facultyNameTH}
              labelPad="ml-7 sm:ml-11"
            />
            {canSeeStaffStatus && (
              <Line
                icon="/Staff Status.png"
                label="สถานะเจ้าหน้าที่"
                value={staffStatusName}
                labelPad="ml-3"
              />
            )}
          </div>

          {canSeeNote && (
            <div className="md:col-span-4 w-full">
              {item.note ? (
                <div className="rounded-2xl overflow-hidden bg-white shadow border border-black/5">
                  <div className="px-2 py-2.5 font-semibold flex items-center gap-2">
                    <span>📝</span>
                    <span>โน้ต</span>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-700">
                    {item.note}
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>

        {/* Edit button */}
        {canDrag && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 z-20 cursor-pointer rounded-full p-2 hover:bg-black/5 transition"
            title="Edit"
            aria-label="Edit card"
          >
            <Image
              src="/pencil.png"
              alt="Edit"
              width={18}
              height={18}
              className="w-[18px] h-[18px] pointer-events-none"
            />
          </button>
        )}

        <div
          className="pointer-events-none absolute inset-0 rounded-[22px] sm:rounded-[28px] -z-10"
          style={{ background: containerBgTint }}
        />
      </div>
    </li>
  );
}

function Line({
  icon,
  label,
  value,
  labelPad,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  labelPad?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm sm:text-base">
      <Image
        src={icon}
        alt={label}
        width={16}
        height={16}
        className="w-4 h-4"
      />
      <span className="font-semibold">{label} :</span>
      <span className={labelPad ?? "ml-8 sm:ml-12"}>{value}</span>
    </div>
  );
}
