"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface UnitIDsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitDesignName: string;
  unitIds: string[];
}

export default function UnitIDsModal({
  isOpen,
  onClose,
  unitDesignName,
  unitIds,
}: UnitIDsModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      document.body.style.overflow = "unset";
      setIsAnimating(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 cursor-pointer backdrop-blur-md ${
        isAnimating ? "bg-black/20" : "bg-black/0"
      }`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg max-w-md w-full overflow-hidden flex flex-col shadow-2xl transition-all duration-200 cursor-default m-4 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Units for {unitDesignName}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {unitIds.length > 0 ? (
            <ul className="space-y-1">
              {unitIds.map((id) => (
                <li key={id} className="px-3 py-1 bg-gray-100 rounded-md text-sm font-mono text-gray-800">
                  {id}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No units assigned to this design.</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

