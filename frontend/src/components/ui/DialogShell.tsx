"use client";
import React from "react";

export default function DialogShell({
  children,
  widthClass = "max-w-md",
}: {
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${widthClass} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}
