// src/lib/ui.ts
export const COURSE_STATUS_COLORS: Record<string, string> = {
    "Not Started": "#9E9E9E",
    "In Progress": "#2196F3",
    "Almost Complete": "#FFC107",
    Completed: "#4CAF50",
    Pause: "#9C27B0",
    Cancel: "#F44336",
  };
  
  const TITLE_GRADIENTS: Record<string, [string, string]> = {
    "Not Started": ["#BDBDBD", "#616161"],
    "In Progress": ["#A9D9FF", "#1D90F6"],
    "Almost Complete": ["#FFCA28", "#FB8C00"],
    Completed: ["#6AE770", "#2B752F"],
    Pause: ["#AB47BC", "#6A1B9A"],
    Cancel: ["#EF5350", "#C62828"],
  };
  
  export const QUEUE_NUMBER_PURPLE = "#8741D9";

  // หลอด percent 
  export function getProgressColor(percent: number) {
      if (percent <= 25) return "bg-red-500";       // 🔴 0–25
      if (percent <= 50) return "bg-orange-400";    // 🟠 26–50
      if (percent <= 75) return "bg-blue-500";      // 🔵 51–75
      return "bg-green-500";                        // 🟢 76–100
    }




  
  export function getTitleGradient(statusName?: string) {
    const key = statusName ?? "Not Started";
    const [c0, c1] = TITLE_GRADIENTS[key] ?? TITLE_GRADIENTS["Not Started"];
    return `linear-gradient(90deg, ${c0}, ${c1})`;
  }
  
  export function hexToRgba(hex: string, alpha = 1) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  export function getStatusColorByName(name?: string) {
    if (!name) return "#9E9E9E";
    return COURSE_STATUS_COLORS[name] ?? "#9E9E9E";
  }
  
  export function toDatetimeLocal(value?: string) {
    if (!value) return "";
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    }
    return "";
  }
  
  export function formatDHMS(totalSeconds: number) {
    const d = Math.max(0, Math.floor(totalSeconds / 86400));
    const h = Math.max(0, Math.floor((totalSeconds % 86400) / 3600));
    const m = Math.max(0, Math.floor((totalSeconds % 3600) / 60));
    const s = Math.max(0, Math.floor(totalSeconds % 60));
    const pad = (n: number) => String(n).padStart(2, "0");
    return { days: d, hours: pad(h), mins: pad(m), secs: pad(s) };
  }
  