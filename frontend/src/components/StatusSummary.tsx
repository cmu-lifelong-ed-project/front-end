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
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-lg font-semibold text-[#8741D9] mb-2">
        สรุปจำนวนคิวตามสถานะ
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {courseStatusList.map((cs) => (
          <div
            key={cs.id}
            className="border rounded-lg p-3 flex flex-col items-center justify-center bg-[#F9F5FF]"
          >
            <span className="text-sm text-gray-600">{cs.status}</span>
            <span className="text-xl font-bold text-[#8741D9]">
              {statusCounts[cs.id] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
