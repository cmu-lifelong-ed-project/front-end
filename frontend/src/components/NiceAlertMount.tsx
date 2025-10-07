"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";

type Toast = { id: number; text: string };

declare global {
  interface Window {
    __niceAlert?: (text: string) => void;
  }
}

export default function NiceAlertMount() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const originalAlert = window.alert;
    window.__niceAlert = (text: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, text }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    };

    // ✅ กำหนด type ของ msg เป็น unknown แทน any
    window.alert = (msg?: unknown) => {
      const message = String(msg ?? "");
      window.__niceAlert?.(message);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="pointer-events-none fixed left-1/2 top-4 z-[9999] -translate-x-1/2 space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto w-[92vw] max-w-md rounded-2xl border border-purple-200 bg-white p-4 shadow-[0_20px_60px_-20px_rgba(24,16,63,0.25)]"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C63FF]/10">
                <AlertCircle className="h-4 w-4 text-[#6C63FF]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-800">
                  แจ้งเตือน
                </div>
                <div className="truncate text-sm text-gray-600">{t.text}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes niceprogress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>,
    document.body
  );
}
