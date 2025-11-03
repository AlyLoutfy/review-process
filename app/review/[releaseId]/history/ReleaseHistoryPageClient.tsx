"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, Building2, CreditCard, AlertCircle, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Release, PaymentPlan, UnitDesign, getReleaseById } from "@/lib/mockData";
import { useActivityLog, ActivityType, type ActivityLog } from "@/lib/useActivityLog";

interface ReleaseHistoryPageClientProps {
  releaseId: string;
}

// Format timestamp to show only hour and minute
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ActivityItem {
  activityType: ActivityType;
  itemId: string;
  itemName: string;
  itemType: "payment-plan" | "unit-design";
  userName: string;
  timestamp: string;
  details?: string;
  item: PaymentPlan | UnitDesign;
}

export default function ReleaseHistoryPageClient({ releaseId: initialReleaseId }: ReleaseHistoryPageClientProps) {
  const pathname = usePathname();
  const activityLog = useActivityLog();
  const [release, setRelease] = useState<Release | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentPagePaymentPlans, setCurrentPagePaymentPlans] = useState(1);
  const [currentPageUnitDesigns, setCurrentPageUnitDesigns] = useState(1);
  const itemsPerPage = 100;

  // Extract releaseId from URL pathname - primary source of truth
  const [extractedReleaseId, setExtractedReleaseId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullPath = window.location.pathname;
      const segments = fullPath.split("/").filter(Boolean);
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      // Find segment after "review" for history page: /review/{releaseId}/history
      const reviewIndex = cleanSegments.indexOf("review");
      if (reviewIndex >= 0 && reviewIndex + 1 < cleanSegments.length) {
        const id = cleanSegments[reviewIndex + 1].replace(/\/$/, "");
        if (id && id !== "fallback") setExtractedReleaseId(id);
      }
    }
  }, [pathname]);

  const actualReleaseId = extractedReleaseId || initialReleaseId || "";

  // Load release on client side
  useEffect(() => {
    const loadRelease = async () => {
      if (actualReleaseId && typeof window !== "undefined") {
        try {
          const loadedRelease = await getReleaseById(actualReleaseId);
          setRelease(loadedRelease);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadRelease();
  }, [actualReleaseId]);

  useEffect(() => {
    if (!release) return;

    // Get all activities for this release
    const releaseActivities = activityLog.getActivitiesByRelease(release.id);

    // Map activities to include the actual item
    const mappedActivities = releaseActivities
      .map((activity) => {
        let item: PaymentPlan | UnitDesign | null = null;

        if (activity.itemType === "payment-plan") {
          item = release.paymentPlans.find((p) => p.id === activity.itemId) || null;
        } else {
          item = release.unitDesigns.find((d) => d.id === activity.itemId) || null;
        }

        if (!item) {
          return null;
        }

        return {
          activityType: activity.activityType,
          itemId: activity.itemId,
          itemName: activity.itemName,
          itemType: activity.itemType,
          userName: activity.userName,
          timestamp: activity.timestamp,
          details: activity.details,
          item,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) as ActivityItem[];

    // Sort by timestamp (most recent first)
    mappedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActivities(mappedActivities);
  }, [activityLog.activities, release]);

  // Group activities by item type
  const paymentPlanActivities = activities.filter((a) => a.itemType === "payment-plan");
  const unitDesignActivities = activities.filter((a) => a.itemType === "unit-design");

  // Pagination calculations
  const totalPaymentPlanActivities = paymentPlanActivities.length;
  const totalUnitDesignActivities = unitDesignActivities.length;
  const totalPagesPaymentPlans = Math.ceil(totalPaymentPlanActivities / itemsPerPage);
  const totalPagesUnitDesigns = Math.ceil(totalUnitDesignActivities / itemsPerPage);

  const startIndexPaymentPlans = (currentPagePaymentPlans - 1) * itemsPerPage;
  const endIndexPaymentPlans = startIndexPaymentPlans + itemsPerPage;
  const paginatedPaymentPlanActivities = paymentPlanActivities.slice(startIndexPaymentPlans, endIndexPaymentPlans);

  const startIndexUnitDesigns = (currentPageUnitDesigns - 1) * itemsPerPage;
  const endIndexUnitDesigns = startIndexUnitDesigns + itemsPerPage;
  const paginatedUnitDesignActivities = unitDesignActivities.slice(startIndexUnitDesigns, endIndexUnitDesigns);

  // Get activity icon and color
  const getActivityIcon = (activityType: ActivityType) => {
    switch (activityType) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "unapproved":
        return <X className="w-4 h-4 text-gray-600" />;
      case "flagged":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "issue_resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "issue_deleted":
        return <Trash2 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityLabel = (activityType: ActivityType) => {
    switch (activityType) {
      case "approved":
        return "Approved";
      case "unapproved":
        return "Unapproved";
      case "flagged":
        return "Flagged Issue";
      case "issue_resolved":
        return "Issue Resolved (Approved)";
      case "issue_deleted":
        return "Issue Deleted";
    }
  };

  const getActivityBgColor = (activityType: ActivityType) => {
    switch (activityType) {
      case "approved":
      case "issue_resolved":
        return "bg-green-100";
      case "flagged":
        return "bg-red-100";
      case "unapproved":
      case "issue_deleted":
        return "bg-gray-100";
    }
  };

  const renderActivityRow = (activity: ActivityItem) => (
    <div key={`${activity.itemId}-${activity.timestamp}-${activity.activityType}`} className="px-4 py-1.5 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`p-1 ${getActivityBgColor(activity.activityType)} rounded-lg shrink-0 flex items-center justify-center`}>{getActivityIcon(activity.activityType)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 text-sm truncate leading-tight">{activity.itemName}</h3>
              <div className="ml-auto shrink-0 flex flex-col items-end">
                <span className="text-xs text-gray-500">
                  {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">by {activity.userName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 -mt-0.5">
              <span className="font-medium leading-tight">{getActivityLabel(activity.activityType)}</span>
              {activity.details && activity.activityType === "flagged" && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 italic truncate">
                    "{activity.details.substring(0, 100)}
                    {activity.details.length > 100 ? "..." : ""}"
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading release history...</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Release History Not Found</h1>
          <p className="text-gray-600">The history for the release you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - Reduced size */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/review/${release.id}/`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-600 hover:text-gray-900" title="Back to review page">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Review History</h1>
              <p className="text-xs text-gray-600">{release.releaseName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 grid grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
          {/* Payment Plans Section */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Plans</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {paymentPlanActivities.length} {paymentPlanActivities.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>

            {paymentPlanActivities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center flex-1 flex items-center justify-center">
                <div>
                  <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No payment plan activities yet.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-200">{paginatedPaymentPlanActivities.map(renderActivityRow)}</div>
                </div>
                {totalPaymentPlanActivities > 0 && (
                  <div className="flex items-center justify-between mt-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 shrink-0">
                    <div className="text-sm text-gray-600">
                      Showing {startIndexPaymentPlans + 1} to {Math.min(endIndexPaymentPlans, totalPaymentPlanActivities)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPagePaymentPlans((prev) => Math.max(1, prev - 1))} disabled={totalPagesPaymentPlans === 1 || currentPagePaymentPlans === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" aria-label="Previous page">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {totalPagesPaymentPlans > 1 && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPagesPaymentPlans }, (_, i) => i + 1).map((page) => {
                            if (page === 1 || page === totalPagesPaymentPlans || (page >= currentPagePaymentPlans - 1 && page <= currentPagePaymentPlans + 1)) {
                              return (
                                <button key={page} onClick={() => setCurrentPagePaymentPlans(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentPagePaymentPlans === page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                                  {page}
                                </button>
                              );
                            } else if (page === currentPagePaymentPlans - 2 || page === currentPagePaymentPlans + 2) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                      {totalPagesPaymentPlans === 1 && (
                        <div className="text-sm text-gray-600">
                          {currentPagePaymentPlans} / {totalPagesPaymentPlans}
                        </div>
                      )}
                      <button onClick={() => setCurrentPagePaymentPlans((prev) => Math.min(totalPagesPaymentPlans, prev + 1))} disabled={totalPagesPaymentPlans === 1 || currentPagePaymentPlans === totalPagesPaymentPlans} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" aria-label="Next page">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unit Designs Section */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Unit Designs</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {unitDesignActivities.length} {unitDesignActivities.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>

            {unitDesignActivities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center flex-1 flex items-center justify-center">
                <div>
                  <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No unit design activities yet.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-200">{paginatedUnitDesignActivities.map(renderActivityRow)}</div>
                </div>
                {totalUnitDesignActivities > 0 && (
                  <div className="flex items-center justify-between mt-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 shrink-0">
                    <div className="text-sm text-gray-600">
                      Showing {startIndexUnitDesigns + 1} to {Math.min(endIndexUnitDesigns, totalUnitDesignActivities)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPageUnitDesigns((prev) => Math.max(1, prev - 1))} disabled={totalPagesUnitDesigns === 1 || currentPageUnitDesigns === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" aria-label="Previous page">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {totalPagesUnitDesigns > 1 && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPagesUnitDesigns }, (_, i) => i + 1).map((page) => {
                            if (page === 1 || page === totalPagesUnitDesigns || (page >= currentPageUnitDesigns - 1 && page <= currentPageUnitDesigns + 1)) {
                              return (
                                <button key={page} onClick={() => setCurrentPageUnitDesigns(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentPageUnitDesigns === page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                                  {page}
                                </button>
                              );
                            } else if (page === currentPageUnitDesigns - 2 || page === currentPageUnitDesigns + 2) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                      {totalPagesUnitDesigns === 1 && (
                        <div className="text-sm text-gray-600">
                          {currentPageUnitDesigns} / {totalPagesUnitDesigns}
                        </div>
                      )}
                      <button onClick={() => setCurrentPageUnitDesigns((prev) => Math.min(totalPagesUnitDesigns, prev + 1))} disabled={totalPagesUnitDesigns === 1 || currentPageUnitDesigns === totalPagesUnitDesigns} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" aria-label="Next page">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
