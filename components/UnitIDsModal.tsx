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
      requestAnimationFrame(() => {
        setIsAnimating(false);
      });
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
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            <span className="text-gray-900">{unitDesignName}</span>
            <span className="text-gray-600 font-normal ml-2">assigned to Units:</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto bg-gray-50">
          {unitIds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unitIds.map((id) => (
                <div
                  key={id}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-800 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-default shadow-sm"
                >
                  {id}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No units assigned to this design.</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer font-medium shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

