"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { getStatusColorByName, hexToRgba } from "@/lib/ui";
import type { CourseStatus } from "../../types/queue";

export default function FilterDropdown({
  items,
  onChange,
  label = "Course Status",
}: {
  items: CourseStatus[];
  onChange?: (selected: string[]) => void; // selected status names
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const toggleOption = (value: string) => {
    setSelected((prev) => {
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      onChange?.(next);
      return next;
    });
  };

  const removeOne = (value: string) => {
    setSelected((prev) => {
      const next = prev.filter((v) => v !== value);
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
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left w-full">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          className="flex items-center gap-3 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <span>{label}</span>
          <span
            aria-hidden="true"
            className="inline-block leading-none select-none"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {/* Selected tags (ภายนอกเมนู) */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selected.map((name) => {
              const color = getStatusColorByName(name);
              const bg = hexToRgba(color, 0.2);
              return (
                <span
                  key={name}
                  className="inline-flex items-center justify-between gap-2 rounded-full border px-3 py-1 text-base font-medium"
                  style={{
                    borderColor: color,
                    background: bg,
                    color: "#2B2B2B",
                  }}
                  title={name}
                >
                  <span className="truncate max-w-[10rem]">{name}</span>
                  {/* Clear button */}
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    className="rounded-full p-0.5 hover:bg-black/10 transition"
                    onClick={() => removeOne(name)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Status dropdown menu */}
      {open && (
        <div
          className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10"
          role="listbox"
          aria-label={`${label} filters`}
        >
          <ul className="max-h-64 overflow-auto p-2 space-y-1">
            {items.map((opt) => {
              const id = `status-${opt.id}`;
              const checked = selected.includes(opt.status);
              const color = getStatusColorByName(opt.status);
              const bg = hexToRgba(color, 0.2);

              return (
                <li key={opt.id} className="px-2 py-1 rounded hover:bg-gray-50">
                  <label
                    htmlFor={id}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => toggleOption(opt.status)}
                    />
                    <span
                      className="inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium leading-none"
                      style={{
                        borderColor: color,
                        background: bg,
                        color: "#2B2B2B",
                      }}
                    >
                      {opt.status}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-gray-200 flex items-center gap-2 p-2">
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => {
                setSelected([]);
                onChange?.([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
