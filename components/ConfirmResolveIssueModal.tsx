"use client";

import { CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ConfirmResolveIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  issueText: string;
  itemName: string;
}

export default function ConfirmResolveIssueModal({
  isOpen,
  onClose,
  onConfirm,
  issueText,
  itemName,
}: ConfirmResolveIssueModalProps) {
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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[10000] flex items-center justify-center transition-opacity duration-200 cursor-pointer backdrop-blur-md ${
          isAnimating ? "bg-black/20" : "bg-black/0"
        }`}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0
        }}
        onClick={onClose}
      >
        <div
          className={`bg-white rounded-lg max-w-md w-full overflow-hidden flex flex-col shadow-2xl transition-all duration-200 cursor-default m-4 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-green-50 border-b border-green-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Confirm Resolution</h2>
                  <p className="text-green-700 text-sm">{itemName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-green-700" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              This item has a flagged issue. Are you sure the following issue has been resolved?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-900 mb-2">Issue:</div>
              <div className="text-sm text-red-800 whitespace-pre-wrap break-words">
                {issueText}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Clicking "Confirm & Approve" will mark this item as reviewed and remove the issue flag.
            </p>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all font-medium shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Approve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

