"use client";
import React from "react";
import { formatDHMS } from "@/lib/ui";

export default function DateLeftCountdown({
  initialDays,
  colorHex,
}: { initialDays: number | undefined; colorHex: string }) {
  const startSeconds = Math.max(0, Math.floor((initialDays ?? 0) * 86400));
  const [secondsLeft, setSecondsLeft] = React.useState<number>(startSeconds);

  React.useEffect(() => setSecondsLeft(startSeconds), [startSeconds]);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const { days, hours, mins, secs } = formatDHMS(secondsLeft);

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
        <span className="text-xs sm:text-sm md:text-base">{String(days).padStart(2, "0")}</span>
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

