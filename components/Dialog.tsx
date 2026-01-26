"use client";

import type { DialogProps } from "@/types/components.dialog.types";
import { useRef, useEffect } from "react";

export default function Dialog({
  isOpen,
  title,
  description,
  content,
  children,
}: DialogProps & { onClose?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef}>
      <div className="w-full h-full bg-black/50 fixed z-1001 top-0 left-0 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 h-3/4 mx-4">
          {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
          {description && <p className="text-gray-600 mb-6">{description}</p>}
          <div className="mb-6">{content}</div>
          <div>{children}</div>
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
