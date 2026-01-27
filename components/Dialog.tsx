"use client";

import { LucideX } from "lucide-react";
import { useEffect, useRef } from "react";

import type { DialogProps } from "@/types/components.dialog.types";

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 rounded-lg shadow-xl p-0 border-0 m-auto max-w-2xl w-full"
      onClose={onClose}
    >
      <div className="bg-white p-6 rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none rounded-md hover:bg-gray-200 transition-all duration-300 p-1"
          >
            <LucideX />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
