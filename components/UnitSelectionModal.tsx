"use client";

import { X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Unit, UnitDesign } from "@/lib/mockData";

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUnit: (unit: Unit) => void;
  units: Unit[];
  unitDesigns: UnitDesign[];
}

export default function UnitSelectionModal({
  isOpen,
  onClose,
  onSelectUnit,
  units,
  unitDesigns,
}: UnitSelectionModalProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsAnimating(true), 10);
      setSelectedUnitId(null);
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

  const handleSelect = (unit: Unit) => {
    setSelectedUnitId(unit.id);
  };

  const handleConfirm = () => {
    if (selectedUnitId) {
      const unit = units.find((u) => u.id === selectedUnitId);
      if (unit) {
        onSelectUnit(unit);
        onClose();
      }
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + " EGP";
  };

  // Sort units by unit ID for consistent display
  const sortedUnits = [...units].sort((a, b) => a.id.localeCompare(b.id));

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-opacity duration-200 cursor-pointer backdrop-blur-md ${
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
        className={`bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-200 cursor-default m-4 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Select Unit</h2>
              <p className="text-blue-700 text-sm mt-1">
                Choose a unit to generate the payment plan preview
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-blue-700" />
            </button>
          </div>
        </div>

        {/* Units List - Compact Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Design</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedUnits.map((unit) => {
                  const design = unitDesigns.find((d) => d.id === unit.unitDesignId);
                  return (
                    <tr
                      key={unit.id}
                      onClick={() => handleSelect(unit)}
                      className={`transition-colors cursor-pointer ${
                        selectedUnitId === unit.id
                          ? "bg-blue-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2">
                        <span className="text-sm font-mono text-gray-900">{unit.id}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm text-gray-700">{design?.name || "Unknown"}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm font-semibold text-gray-900">{formatPrice(unit.price)}</span>
                      </td>
                      <td className="px-4 py-2">
                        {selectedUnitId === unit.id && (
                          <div className="flex items-center justify-center">
                            <div className="p-1 bg-blue-500 rounded-full">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
            disabled={!selectedUnitId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Generate Payment Plan
          </button>
        </div>
      </div>
    </div>
  );
}

