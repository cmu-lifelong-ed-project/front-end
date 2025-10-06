"use client";

import React from "react";

type CourseStatus = {
  id: number;
  status: string;
};

type Card = {
  id: number;
  title: string;
  course_status_id: number;
};

interface StatusSummaryProps {
  courseStatusList: CourseStatus[];
  cards: Card[];
}

export default function StatusSummary({ courseStatusList, cards }: StatusSummaryProps) {
  // 🧭 ดึง role จาก localStorage 
  const [role, setRole] = React.useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("role");
      if (savedRole) setRole(savedRole);
    }
  }, []);

  // 🧮 นับจำนวนคิวตาม course_status_id
  const statusCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (const c of cards) {
      const sid = c.course_status_id;
      counts[sid] = (counts[sid] || 0) + 1;
    }
    return counts;
  }, [cards]);

  return (
    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(24,16,63,0.1)] border border-purple-100 p-6 mb-6">
      {/* ✅ แสดงหัวข้อเฉพาะเมื่อ role === "admin" */}
      {role === "admin" && (
        <h3 className="text-lg sm:text-xl font-semibold text-[#8741D9] mb-4">
          สรุปจำนวนคิวตามสถานะ
        </h3>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courseStatusList.map((cs) => (
          <div
            key={cs.id}
            className="rounded-2xl bg-white p-3 text-center border border-gray-100 shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-sm font-regular text-[#858585] mb-3 block">
              {cs.status}
            </span>
            <span className="text-3xl font-semibold text-[#8741D9] leading-none">
              {statusCounts[cs.id] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
