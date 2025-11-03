"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Image as ImageIcon, CheckCircle2, Flag, Trash2, Eye } from "lucide-react";
import { UnitDesign, Unit } from "@/lib/mockData";
import MediaModal from "../MediaModal";
import IssueModal from "../IssueModal";
import ConfirmResolveIssueModal from "../ConfirmResolveIssueModal";
import ConfirmDeleteIssueModal from "../ConfirmDeleteIssueModal";
import { Issue } from "@/lib/useIssueState";
import { ReviewRecord } from "@/lib/useReviewedState";
import MediaPreview from "../MediaPreview";
import UnitIDsModal from "../UnitIDsModal";

interface UnitDesignListViewProps {
  unitDesign: UnitDesign;
  isReviewed: boolean;
  reviewRecord?: ReviewRecord | null;
  onToggleReviewed: () => void;
  hasIssues: boolean;
  latestIssue: Issue | null;
  onIssueSubmit: (text: string, file: File | null) => void;
  onResolveIssue: () => void;
  onDeleteIssue: () => void;
  units: Unit[];
}

export default function UnitDesignListView({ unitDesign, isReviewed, reviewRecord, onToggleReviewed, hasIssues, latestIssue, onIssueSubmit, onResolveIssue, onDeleteIssue, units }: UnitDesignListViewProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isUnitIDsModalOpen, setIsUnitIDsModalOpen] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaModalInitialSection, setMediaModalInitialSection] = useState<"offer" | "unit" | "floor" | undefined>();
  const [mediaModalInitialImageIndex, setMediaModalInitialImageIndex] = useState<number | undefined>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handlePreview = () => {
    window.open(unitDesign.previewUrl, "_blank");
  };

  const handleViewMedia = (section?: "offer" | "unit" | "floor", imageIndex?: number) => {
    setMediaModalInitialSection(section);
    setMediaModalInitialImageIndex(imageIndex);
    setIsMediaModalOpen(true);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasIssues && !isReviewed && latestIssue) {
      setIsConfirmModalOpen(true);
    } else {
      onToggleReviewed();
    }
  };

  const handleConfirmResolve = () => {
    onResolveIssue();
    onToggleReviewed();
  };

  const handleFlagIssue = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsIssueModalOpen(true);
  };

  const handleIssueSubmit = (text: string, file: File | null) => {
    onIssueSubmit(text, file);
  };

  // Filter units assigned to this unit design
  const assignedUnits = units.filter((unit) => unit.unitDesignId === unitDesign.id);
  const unitCount = assignedUnits.length;
  const unitIds = assignedUnits.map((unit) => unit.id).sort();

  return (
    <>
      <div className={`rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden ${isReviewed ? "bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-400/60" : hasIssues ? "bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-400/60" : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-white"}`}>
        {/* Subtle background accent */}
        {!isReviewed && !hasIssues && <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
        {/* Review and Flag Buttons - Top Right */}
        <div className="absolute top-5 right-5 flex flex-col items-end gap-2 z-10">
          <div className="flex items-start gap-2">
            <div className="relative z-50 flex flex-col items-end">
              <button
                onClick={handleFlagIssue}
                onMouseEnter={(e) => {
                  if (hasIssues) {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                    setIsTooltipVisible(true);
                  }
                }}
                onMouseLeave={() => {
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setIsTooltipVisible(false);
                  }, 200);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-all duration-200 cursor-pointer relative group justify-center ${hasIssues ? "bg-red-100 hover:bg-red-200 border border-red-300 shadow-sm" : "bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 shadow-sm"}`}
                aria-label="Flag issue"
                title={hasIssues ? "View issue" : "Flag issue"}
              >
                <Flag className={`w-4 h-4 transition-colors ${hasIssues ? "text-red-700 fill-red-700" : "text-gray-600 group-hover:text-red-600"}`} />
                <span className={`text-xs font-semibold ${hasIssues ? "text-red-700" : "text-gray-600 group-hover:text-red-600"}`}>{hasIssues ? "View Issue" : "Flag Issue"}</span>
              </button>
            </div>
            <div className="flex flex-col items-end">
              <button onClick={handleToggle} className={`group flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-all duration-200 cursor-pointer justify-center ${isReviewed ? "bg-green-100 hover:bg-green-200 border border-green-300 shadow-sm" : "bg-white hover:bg-green-50 border border-gray-300 hover:border-green-300 shadow-sm"}`} aria-label={isReviewed ? "Mark as pending" : "Mark as reviewed"} title={isReviewed ? "Mark as pending" : "Mark as reviewed"}>
                <CheckCircle2 className={`w-4 h-4 transition-colors ${isReviewed ? "text-green-700 fill-green-700" : "text-gray-600 group-hover:text-green-600"}`} />
                <span className={`text-xs font-semibold ${isReviewed ? "text-green-700" : "text-gray-600 group-hover:text-green-600"}`}>{isReviewed ? "Approved" : "Approve"}</span>
              </button>
              {isReviewed && reviewRecord && (
                <div className="text-[10px] text-green-600/80 mt-0.5 text-right flex items-center justify-end gap-1">
                  by {reviewRecord.userName}
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/review-process/images/sodic.png"
                      alt="Sodic"
                      className="w-[14px] h-[14px] object-contain cursor-pointer"
                      onError={(e) => {
                        // Fallback to base path if basePath fails
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.fallbackUsed) {
                          target.dataset.fallbackUsed = "true";
                          target.src = "/images/sodic.png";
                        }
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                      Sodic
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {hasIssues && latestIssue && (
            <div
              className={`fixed w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-2xl transition-all duration-200 ${isTooltipVisible ? "opacity-100 visible scale-100 pointer-events-auto" : "opacity-0 invisible scale-95 pointer-events-none"}`}
              style={{
                zIndex: 9999,
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y - 10}px`,
                transform: isTooltipVisible ? "translate(-50%, -100%) scale(1)" : "translate(-50%, -100%) scale(0.95)",
              }}
              onMouseEnter={() => {
                if (tooltipTimeoutRef.current) {
                  clearTimeout(tooltipTimeoutRef.current);
                  tooltipTimeoutRef.current = null;
                }
                setIsTooltipVisible(true);
              }}
              onMouseLeave={() => {
                tooltipTimeoutRef.current = setTimeout(() => {
                  setIsTooltipVisible(false);
                }, 200);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-red-300">Issue Reported</div>
                  {latestIssue.userName && <div className="text-xs text-gray-400 mt-0.5">by {latestIssue.userName}</div>}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsTooltipVisible(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1 hover:bg-red-600 rounded transition-colors cursor-pointer shrink-0"
                  aria-label="Delete issue"
                >
                  <Trash2 className="w-4 h-4 text-red-300" />
                </button>
              </div>
              <div className="whitespace-pre-wrap" style={{ wordBreak: "break-word" }}>
                {latestIssue.text}
              </div>
              {latestIssue.fileName && <div className="mt-2 text-xs text-gray-400">File: {latestIssue.fileName}</div>}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900 pointer-events-none" style={{ borderLeftWidth: "6px", borderRightWidth: "6px", borderTopWidth: "6px" }}></div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-8 relative">
          {/* Content - Left Side */}
          <div className="shrink-0 w-64 pr-8 border-r border-gray-200/60">
            <h3 className={`text-xl font-bold mb-4 tracking-tight ${isReviewed ? "text-gray-400 line-through" : "text-gray-900"}`}>{unitDesign.name}</h3>

            {unitDesign.amenities && unitDesign.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {unitDesign.amenities.map((amenity, idx) => (
                  <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                    {amenity}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium text-gray-500">Bedrooms:</span>
                <span className={`text-sm font-bold ${isReviewed ? "text-gray-400" : "text-gray-900"}`}>{unitDesign.beds === 0 ? "Studio" : `${unitDesign.beds} Bed${unitDesign.beds > 1 ? "s" : ""}`}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium text-gray-500">BUA:</span>
                <span className={`text-sm font-bold ${isReviewed ? "text-gray-400" : "text-gray-900"}`}>{unitDesign.bua} m²</span>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-gray-200/60">
                <span className="text-sm font-medium text-gray-500">Units Assigned:</span>
                <span className={`text-sm font-bold ${isReviewed ? "text-gray-400" : "text-blue-600"}`}>{unitCount}</span>
                {unitCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUnitIDsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200 cursor-pointer -ml-1"
                    title="View assigned unit IDs"
                    aria-label="View assigned unit IDs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => handleViewMedia()} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer h-9 ${isReviewed ? "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200" : "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 hover:from-blue-100 hover:to-blue-200 border border-blue-200/60 shadow-sm hover:shadow-md"}`}>
                <ImageIcon className="w-3.5 h-3.5" />
                View All Media
              </button>
              <button onClick={handlePreview} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer h-9 ${isReviewed ? "bg-gray-200 text-gray-500 hover:bg-gray-300 border border-gray-300" : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"}`}>
                <Download className="w-3.5 h-3.5" />
                Preview Offer
              </button>
            </div>
          </div>

          {/* Media Preview - Middle (taking remaining width) */}
          <div className="flex-1 min-w-0">
            <MediaPreview media={unitDesign.media} onClick={handleViewMedia} maxImages={999} showSections={true} compact={false} showAll={true} />
          </div>
        </div>
      </div>

      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setMediaModalInitialSection(undefined);
          setMediaModalInitialImageIndex(undefined);
        }}
        media={unitDesign.media}
        unitName={unitDesign.name}
        bedrooms={unitDesign.beds}
        bua={unitDesign.bua}
        initialSection={mediaModalInitialSection}
        initialImageIndex={mediaModalInitialImageIndex}
      />

      <IssueModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} onSubmit={handleIssueSubmit} itemName={unitDesign.name} initialText={latestIssue?.text || ""} initialFileName={latestIssue?.fileName || null} createdBy={latestIssue?.userName || null} />

      <ConfirmResolveIssueModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmResolve} issueText={latestIssue?.text || ""} itemName={unitDesign.name} />

      <ConfirmDeleteIssueModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={onDeleteIssue} issueText={latestIssue?.text || ""} itemName={unitDesign.name} />

      <UnitIDsModal isOpen={isUnitIDsModalOpen} onClose={() => setIsUnitIDsModalOpen(false)} unitDesignName={unitDesign.name} unitIds={unitIds} />
    </>
  );
}
