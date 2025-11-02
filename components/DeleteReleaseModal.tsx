"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Release } from "@/lib/mockData";

interface DeleteReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  release: Release | null;
}

export default function DeleteReleaseModal({ isOpen, onClose, onConfirm, release }: DeleteReleaseModalProps) {
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

  if (!isOpen || !release) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
          className={`bg-white rounded-lg max-w-md w-full shadow-2xl transition-all duration-200 cursor-default m-4 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Release</h2>
                  <p className="text-sm text-gray-600 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{release.releaseName}"</span>?
            </p>
            <p className="text-sm text-gray-600">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 mb-4 ml-2">
              <li>The release and all its data</li>
              <li>All review history</li>
              <li>All flagged issues</li>
              <li>All activity logs for this release</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all font-medium shadow-sm hover:shadow-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all font-medium shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Release
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

