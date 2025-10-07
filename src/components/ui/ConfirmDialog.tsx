"use client";
import Backdrop from "./Backdrop";
import DialogShell from "./DialogShell";

export default function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <Backdrop onClose={onCancel} />
      <DialogShell>
        <div className="p-6 sm:p-8 text-center">
          <h4 className="text-xl font-extrabold text-[#7D3F98]">{title}</h4>
          <p className="mt-2 text-sm text-gray-700">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </DialogShell>
    </>
  );
}
