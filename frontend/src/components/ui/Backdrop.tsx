"use client";
import React from "react";

export default function Backdrop({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden
    />
  );
}
