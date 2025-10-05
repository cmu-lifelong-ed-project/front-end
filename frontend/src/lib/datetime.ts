export function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
