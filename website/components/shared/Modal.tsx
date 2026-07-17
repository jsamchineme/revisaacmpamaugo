"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal overlay + centered box — matching .modal from template.
 * Closes on overlay click. Close button (×) rendered inside.
 */
export function Modal({ open, onClose, children }: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-[40px_20px] bg-[rgba(30,20,15,0.55)] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-paper max-w-[760px] w-full rounded shadow-card p-[clamp(24px,5vw,64px)] relative my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky float-right top-0 bg-burgundy text-white border-none w-[40px] h-[40px] rounded-full text-[1.3rem] cursor-pointer z-[2] flex items-center justify-center"
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}
