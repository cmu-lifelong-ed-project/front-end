"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X, Search as SearchIcon } from "lucide-react"; // NEW
import { getStatusColorByName, hexToRgba } from "@/lib/ui";
import type { CourseStatus } from "@/types/api/status";

export default function FilterDropdown({
  items,
  onChange,
  onSearch, //callback ส่งคำค้น
  label = "สถานะรายวิชา",
}: {
  items: CourseStatus[];
  onChange?: (selectedIds: number[]) => void;
  onSearch?: (q: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const doSearch = () => onSearch?.(query.trim());

  const toggleOption = (id: number) => {
    setSelected((prev) => {
      const next = prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id];
      onChange?.(next);
      return next;
    });
  };

  const removeOne = (id: number) => {
    setSelected((prev) => {
      const next = prev.filter((v) => v !== id);
      onChange?.(next);
      return next;
    });
  };
  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Close on Esc
  const onKeyDownBtn = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left w-full">
      <div className="flex items-center gap-2 flex-wrap">
        {/* ปุ่มเปิด/ปิดเมนู */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKeyDownBtn}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="font-regular">{label}</span>
          {selected.length > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8741D9] text-white text-xs">
              {selected.length}
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className="text-[#8696BB]" />
          ) : (
            <ChevronDown size={16} className="text-[#8696BB]" />
          )}
        </button>

        {/* ช่องค้นหา */}
        <div className="relative flex-1 min-w-[180px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8696BB]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSearch();
            }}
            placeholder="กรอกรายละเอียดที่ต้องการค้นหา..."
            aria-label="Search"
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-[#8696BB] focus:outline-none focus:ring-2 focus:ring-[#8741D9]/30 focus:border-[#8741D9]"
          />
        </div>

        {/* ปุ่มเสริมด้านขวา */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={doSearch} // NEW
            className="px-4 py-2 rounded-xl border border-[#8741D9] text-[#8741D9] bg-white text-sm hover:bg-[#8741D9]/5 transition"
          >
            ค้นหา
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#F0E7FF] text-[#8741D9] text-sm hover:bg-[#E8DCFF] transition"
            onClick={() => {
              setSelected([]);
              onChange?.([]);
              setQuery(""); // เคลียร์ช่องค้นหา
              onSearch?.(""); // แจ้งให้ล้างผลค้นหา
            }}
          >
            ลบตัวกรอง
          </button>
        </div>
      </div>

      {/* Status dropdown menu */}
      {open && (
        <div
          className="absolute mt-2 w-72 bg-white border border-gray-200 rounded-2xl z-10"
          role="listbox"
          aria-label={`${label} filters`}
        >
          <div className="px-4 py-2 text-sm text-gray-500 font-medium">
            ตัวกรอง
          </div>
          <ul className="max-h-64 overflow-auto px-3 pb-3 space-y-2">
            {items.map((opt) => {
              const id = `status-${opt.id}`;
              const checked = selected.includes(opt.id);
              return (
                <li
                  key={opt.id}
                  className="px-2 py-1 hover:bg-gray-50 rounded-md"
                >
                  <label
                    htmlFor={id}
                    className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-800"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      className="h-4 w-4 rounded border border-gray-300 accent-[#8741D9]"
                      checked={checked}
                      onChange={() => toggleOption(opt.id)}
                    />
                    <span>{opt.status}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
