"use client";

import { LucideX } from "lucide-react";
import { useEffect, useRef } from "react";

export interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Sidebar({
  isOpen,
  onClose,
  title,
  children,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-51 overflow-y-auto`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary">
            {title && <h2 className="text-2xl font-medium">{title}</h2>}
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none rounded-md hover:bg-gray-200 transition-all duration-300 p-1 shrink-0"
              aria-label="Close sidebar"
            >
              <LucideX />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pr-2">{children}</div>
        </div>
      </div>
    </>
  );
}
