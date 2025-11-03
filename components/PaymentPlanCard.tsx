"use client";

import { Download, CheckCircle2, Flag, Trash2, Check, X } from "lucide-react";
import { PaymentPlan, Unit, UnitDesign } from "@/lib/mockData";
import { useState, useRef, useEffect } from "react";
import IssueModal from "./IssueModal";
import ConfirmResolveIssueModal from "./ConfirmResolveIssueModal";
import ConfirmDeleteIssueModal from "./ConfirmDeleteIssueModal";
import UnitSelectionModal from "./UnitSelectionModal";
import { Issue } from "@/lib/useIssueState";
import { ReviewRecord } from "@/lib/useReviewedState";

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  isReviewed: boolean;
  reviewRecord?: ReviewRecord | null;
  onToggleReviewed: () => void;
  hasIssues: boolean;
  latestIssue: Issue | null;
  onIssueSubmit: (text: string, file: File | null) => void;
  onResolveIssue: () => void;
  onDeleteIssue: () => void;
  units: Unit[];
  unitDesigns: UnitDesign[];
}

export default function PaymentPlanCard({ plan, isReviewed, reviewRecord, onToggleReviewed, hasIssues, latestIssue, onIssueSubmit, onResolveIssue, onDeleteIssue, units, unitDesigns }: PaymentPlanCardProps) {
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isUnitSelectionModalOpen, setIsUnitSelectionModalOpen] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handlePreview = () => {
    setIsUnitSelectionModalOpen(true);
  };

  const handleUnitSelect = (unit: Unit) => {
    // In the real implementation, this would generate the payment plan PDF
    // For MVP, we just open the preview URL as before
    window.open(plan.previewUrl, "_blank");
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If there's an issue and item is not yet reviewed, show confirmation
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

  return (
    <>
      <div className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 border-2 ${isReviewed ? "bg-green-50/60 border-green-400/60" : hasIssues ? "bg-red-50/60 border-red-400/60" : "bg-white border-transparent hover:border-blue-400/60 hover:bg-gray-50/50"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <h3 className={`text-lg font-semibold flex-1 break-words ${isReviewed ? "text-gray-700 line-through" : "text-gray-900"}`}>{plan.name}</h3>
            <div className="flex flex-col items-end gap-2 ml-2 flex-shrink-0 w-full max-w-[140px]">
              <div className="flex flex-col items-end w-full">
                <button onClick={handleToggle} className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer w-full justify-center ${isReviewed ? "bg-green-100 hover:bg-green-200 border border-green-300" : "bg-white hover:bg-green-50 border border-gray-300 hover:border-green-300"}`} aria-label={isReviewed ? "Mark as pending" : "Mark as reviewed"} title={isReviewed ? "Mark as pending" : "Mark as reviewed"}>
                  <CheckCircle2 className={`w-4 h-4 transition-colors ${isReviewed ? "text-green-700 fill-green-700" : "text-gray-600 group-hover:text-green-600"}`} />
                  <span className={`text-xs font-medium ${isReviewed ? "text-green-700" : "text-gray-600 group-hover:text-green-600"}`}>{isReviewed ? "Approved" : "Approve"}</span>
                </button>
                {isReviewed && reviewRecord && (
                  <div className="text-[10px] text-green-600/80 mt-0.5 text-right w-full flex items-center justify-end gap-1">
                    by {reviewRecord.userName}
                    <div className="relative group">
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
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative z-50 w-full">
                <button
                  onClick={handleFlagIssue}
                  onMouseEnter={(e) => {
                    if (hasIssues) {
                      // Clear any pending timeout
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
                    // Delay closing to allow mouse to move into tooltip
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setIsTooltipVisible(false);
                    }, 200);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer relative group w-full justify-center ${hasIssues ? "bg-red-100 hover:bg-red-200 border border-red-300" : "bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300"}`}
                  aria-label="Flag issue"
                  title={hasIssues ? "View issue" : "Flag issue"}
                >
                  <Flag className={`w-4 h-4 transition-colors ${hasIssues ? "text-red-700 fill-red-700" : "text-gray-600 group-hover:text-red-600"}`} />
                  <span className={`text-xs font-medium ${hasIssues ? "text-red-700" : "text-gray-600 group-hover:text-red-600"}`}>{hasIssues ? "View Issue" : "Flag Issue"}</span>
                </button>
                {hasIssues && latestIssue && (
                  <div
                    className={`fixed w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-2xl transition-all duration-200 z-[9999] ${isTooltipVisible ? "opacity-100 visible scale-100 pointer-events-auto" : "opacity-0 invisible scale-95 pointer-events-none"}`}
                    style={{
                      left: `${tooltipPosition.x}px`,
                      top: `${tooltipPosition.y - 10}px`,
                      transform: isTooltipVisible ? "translate(-50%, -100%) scale(1)" : "translate(-50%, -100%) scale(0.95)",
                    }}
                    onMouseEnter={() => {
                      // Clear any pending timeout when mouse enters tooltip
                      if (tooltipTimeoutRef.current) {
                        clearTimeout(tooltipTimeoutRef.current);
                        tooltipTimeoutRef.current = null;
                      }
                      setIsTooltipVisible(true);
                    }}
                    onMouseLeave={() => {
                      // Delay closing to allow mouse to move back to button
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
                        className="p-1 hover:bg-red-600 rounded transition-colors cursor-pointer flex-shrink-0"
                        aria-label="Delete issue"
                      >
                        <Trash2 className="w-4 h-4 text-red-300" />
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap break-words">{latestIssue.text}</div>
                    {latestIssue.fileName && <div className="mt-2 text-xs text-gray-400">File: {latestIssue.fileName}</div>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900 pointer-events-none"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 mb-3 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-600">Down Payment:</span>
              <span className={`text-base font-bold ${isReviewed ? "text-gray-500" : "text-blue-600"}`}>{plan.downPayment}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Payment Period:</span>
              <span className={`text-sm font-semibold ${isReviewed ? "text-gray-500" : "text-gray-900"}`}>{plan.years === 0 ? "Cash" : `${plan.years} Year${plan.years > 1 ? "s" : ""}`}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {plan.includesMaintenance ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-400" />}
                <span className={`text-xs ${plan.includesMaintenance ? "text-green-700 font-medium" : "text-gray-500"}`}>Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                {plan.includesClubFees ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-400" />}
                <span className={`text-xs ${plan.includesClubFees ? "text-green-700 font-medium" : "text-gray-500"}`}>Club Fees</span>
              </div>
            </div>
          </div>

          <button onClick={handlePreview} className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer ${isReviewed ? "bg-gray-200 text-gray-600 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"}`}>
            <Download className="w-4 h-4" />
            Preview Payment Plan
          </button>
        </div>
      </div>

      <IssueModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} onSubmit={handleIssueSubmit} itemName={plan.name} initialText={latestIssue?.text || ""} initialFileName={latestIssue?.fileName || null} createdBy={latestIssue?.userName || null} />

      <ConfirmResolveIssueModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmResolve} issueText={latestIssue?.text || ""} itemName={plan.name} />

      <ConfirmDeleteIssueModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={onDeleteIssue} issueText={latestIssue?.text || ""} itemName={plan.name} />

      <UnitSelectionModal isOpen={isUnitSelectionModalOpen} onClose={() => setIsUnitSelectionModalOpen(false)} onSelectUnit={handleUnitSelect} units={units} unitDesigns={unitDesigns} />
    </>
  );
}
