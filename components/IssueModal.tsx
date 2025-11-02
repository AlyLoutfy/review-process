"use client";

import { X, Upload, File } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, file: File | null) => void;
  itemName: string;
  initialText?: string;
  initialFileName?: string | null;
}

export default function IssueModal({
  isOpen,
  onClose,
  onSubmit,
  itemName,
  initialText = "",
  initialFileName = null,
}: IssueModalProps) {
  const [issueText, setIssueText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsAnimating(true), 10);
      // Pre-populate fields when modal opens
      if (initialText) {
        setIssueText(initialText);
      }
      // Note: We can't pre-populate the file input for security reasons,
      // but we can show the file name if it exists
    } else {
      document.body.style.overflow = "unset";
      requestAnimationFrame(() => {
        setIssueText("");
        setSelectedFile(null);
        setIsAnimating(false);
      });
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialText]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(issueText.trim(), selectedFile);
      setIssueText("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    } catch (error) {
      console.error("Error submitting issue:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          className={`bg-white rounded-lg max-w-2xl w-full overflow-hidden flex flex-col shadow-2xl transition-all duration-200 cursor-default m-4 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-red-900">Flag Issue</h2>
                <p className="text-red-700 text-sm mt-1">{itemName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-red-700" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="flex-1 p-6 space-y-4">
              <div>
                <label
                  htmlFor="issue-text"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Describe the issue <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="issue-text"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Please describe the issue you've encountered..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="issue-file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Attach file (optional)
                  {initialFileName && !selectedFile && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Previously: {initialFileName})
                    </span>
                  )}
                </label>
                {selectedFile ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <File className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="issue-file"
                    className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, images, or documents
                    </span>
                    <input
                      ref={fileInputRef}
                      id="issue-file"
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!issueText.trim() || isSubmitting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

