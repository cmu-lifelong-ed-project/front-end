"use client";
import { useEffect } from "react";
import Backdrop from "./Backdrop";
import DialogShell from "./DialogShell";

export default function SuccessOverlay({
  title = "Thank You !",
  message = "Your Action Successful",
  onClose,
  autoCloseMs = 2000,
}: {
  title?: string;
  message?: string;
  onClose: () => void;
  autoCloseMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [onClose, autoCloseMs]);

  return (
    <>
      <Backdrop />
      <DialogShell widthClass="max-w-[360px]">
        <div className="p-8 text-center">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-full grid place-items-center"
            style={{ backgroundColor: "rgba(52,199,89,0.12)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#34C759" strokeWidth="2" />
              <path d="M7 12.5l3 3 7-7" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h4 className="text-xl font-extrabold text-[#2D3748]">{title}</h4>
          <p className="mt-1 text-sm text-[#6B7280]">{message}</p>
        </div>
      </DialogShell>
    </>
  );
}
