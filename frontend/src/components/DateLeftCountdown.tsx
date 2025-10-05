"use client";
import { useEffect, useState } from "react";
import { formatDHMS } from "@/lib/datetime";

export default function DateLeftCountdown({
  deadlineISO,
  colorHex,
}: {
  deadlineISO: string | undefined;
  colorHex: string;
}) {
  const deadlineMs = deadlineISO ? Date.parse(deadlineISO) : NaN;
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffSec = Number.isFinite(deadlineMs)
    ? Math.max(0, Math.floor((deadlineMs - now) / 1000))
    : 0;

  const { days, hours, mins, secs } = formatDHMS(diffSec);

  return (
    <div className="flex flex-col items-end select-none">
      <div className="flex items-baseline gap-2">
        <span
          className="uppercase tracking-[0.16em] text-[9px] sm:text-[10px] md:text-[11px] font-semibold -top-1 relative"
          style={{ color: colorHex }}
        >
          Date Left
        </span>
        <div className="flex items-baseline gap-2 text-[#514F54]">
          <span className="text-xs sm:text-sm md:text-base">
            {String(days).padStart(2, "0")}
          </span>
          <span className="text-xs sm:text-sm md:text-base">:</span>
          <span className="text-xs sm:text-sm md:text-base">{hours}</span>
          <span className="text-xs sm:text-sm md:text-base">:</span>
          <span className="text-xs sm:text-sm md:text-base">{mins}</span>
          <span className="text-xs sm:text-sm md:text-base">:</span>
          <span className="text-xs sm:text-sm md:text-base">{secs}</span>
        </div>
      </div>
      <div className="mt-0.5 flex gap-3 text-[6px] sm:text-[7px] md:text-[8px] text-[#C8C8C8]">
        <span>Days</span>
        <span>Hours</span>
        <span>Minutes</span>
        <span>Seconds</span>
      </div>
    </div>
  );
}
