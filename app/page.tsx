"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllReleases, deleteRelease } from "@/lib/mockData";
import { Release } from "@/lib/mockData";
import { Plus, Calendar, Building2, Copy, Check, AlertCircle, CreditCard, History, Trash2 } from "lucide-react";
import DeleteReleaseModal from "@/components/DeleteReleaseModal";

type Filter = "all" | "pending" | "reviewed" | "flagged";

interface ReleaseStatus {
  reviewedCount: number;
  totalCount: number;
  hasIssues: boolean;
  isComplete: boolean;
}

// Helper function to get release status from localStorage
// This matches the same logic used in useReviewedState and useIssueState
// IMPORTANT: Only counts items that actually exist in the release to prevent stale data issues
const getReleaseStatus = (release: Release): ReleaseStatus => {
  if (typeof window === "undefined") {
    return { reviewedCount: 0, totalCount: 0, hasIssues: false, isComplete: false };
  }

  let reviewedCount = 0;
  let hasIssues = false;

  // Create sets of valid item IDs for validation
  const validPaymentPlanIds = new Set(release.paymentPlans.map((p) => p.id));
  const validUnitDesignIds = new Set(release.unitDesigns.map((d) => d.id));

  // Check payment plans - reviewed items
  const ppReviewedKey = `reviewed-${release.id}-payment-plan`;
  try {
    const ppReviewed = localStorage.getItem(ppReviewedKey);
    if (ppReviewed) {
      const data = JSON.parse(ppReviewed);
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Check if it's the old format (just IDs as strings)
          if (typeof data[0] === "string") {
            // Only count IDs that exist in the release
            reviewedCount += data.filter((id: string) => validPaymentPlanIds.has(id)).length;
          } else if (Array.isArray(data[0]) && data[0].length === 2) {
            // Compact or full format: [[id, ...], ...]
            // Only count IDs that exist in the release
            reviewedCount += data.filter((entry: [string, unknown]) => {
              const [itemId] = entry;
              return validPaymentPlanIds.has(itemId);
            }).length;
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  // Check payment plans - issues
  const ppIssuesKey = `issues-${release.id}-payment-plan`;
  try {
    const ppIssues = localStorage.getItem(ppIssuesKey);
    if (ppIssues) {
      const data = JSON.parse(ppIssues);
      // issuesMap is an array of [id, issues[]] pairs
      if (Array.isArray(data) && data.length > 0) {
        for (const entry of data) {
          if (Array.isArray(entry) && entry.length === 2) {
            const [itemId, itemIssues] = entry;
            // Only check issues for items that exist in the release
            if (validPaymentPlanIds.has(itemId)) {
              // itemIssues is either an array of Issue objects or compact format arrays
              if (Array.isArray(itemIssues) && itemIssues.length > 0) {
                hasIssues = true;
                break;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  // Check unit designs - reviewed items
  const udReviewedKey = `reviewed-${release.id}-unit-design`;
  try {
    const udReviewed = localStorage.getItem(udReviewedKey);
    if (udReviewed) {
      const data = JSON.parse(udReviewed);
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Check if it's the old format (just IDs as strings)
          if (typeof data[0] === "string") {
            // Only count IDs that exist in the release
            reviewedCount += data.filter((id: string) => validUnitDesignIds.has(id)).length;
          } else if (Array.isArray(data[0]) && data[0].length === 2) {
            // Compact or full format: [[id, ...], ...]
            // Only count IDs that exist in the release
            reviewedCount += data.filter((entry: [string, unknown]) => {
              const [itemId] = entry;
              return validUnitDesignIds.has(itemId);
            }).length;
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  // Check unit designs - issues
  const udIssuesKey = `issues-${release.id}-unit-design`;
  try {
    const udIssues = localStorage.getItem(udIssuesKey);
    if (udIssues) {
      const data = JSON.parse(udIssues);
      // issuesMap is an array of [id, issues[]] pairs
      if (Array.isArray(data) && data.length > 0) {
        for (const entry of data) {
          if (Array.isArray(entry) && entry.length === 2) {
            const [itemId, itemIssues] = entry;
            // Only check issues for items that exist in the release
            if (validUnitDesignIds.has(itemId)) {
              // itemIssues is either an array of Issue objects or compact format arrays
              if (Array.isArray(itemIssues) && itemIssues.length > 0) {
                hasIssues = true;
                break;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  const totalCount = release.paymentPlans.length + release.unitDesigns.length;
  // Ensure reviewedCount never exceeds totalCount (defensive check)
  reviewedCount = Math.min(reviewedCount, totalCount);
  const isComplete = reviewedCount === totalCount && !hasIssues;

  return { reviewedCount, totalCount, hasIssues, isComplete };
};

export default function Home() {
  // Initialize with empty array to avoid hydration mismatch
  // Will be populated in useEffect after mount
  const [releases, setReleases] = useState<Release[]>([]);
  const [copiedReleaseId, setCopiedReleaseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  // Initialize with empty statuses to avoid hydration mismatch
  // Will be populated in useEffect after mount
  const [releaseStatuses, setReleaseStatuses] = useState<Map<string, ReleaseStatus>>(new Map());
  const [isHydrated, setIsHydrated] = useState(false);
  const [deleteModalRelease, setDeleteModalRelease] = useState<Release | null>(null);

  // Load releases and statuses after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Handle client-side routing from 404.html redirect
      const redirectPath = sessionStorage.getItem("nextjs-redirect");
      if (redirectPath) {
        sessionStorage.removeItem("nextjs-redirect");
        // Update browser history to the original path
        // Next.js router will handle the routing when the page loads
        window.history.replaceState({}, "", redirectPath);
        // Trigger a navigation event that Next.js will pick up
        window.dispatchEvent(new PopStateEvent("popstate"));
      }

      const allReleases = getAllReleases();
      setReleases(allReleases);

      // Calculate statuses for all releases
      const statuses = new Map<string, ReleaseStatus>();
      allReleases.forEach((release) => {
        statuses.set(release.id, getReleaseStatus(release));
      });
      setReleaseStatuses(statuses);
      setIsHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh statuses when localStorage changes (listen for storage events)
  useEffect(() => {
    const handleStorageChange = () => {
      const allReleases = getAllReleases();
      const statuses = new Map<string, ReleaseStatus>();
      allReleases.forEach((release) => {
        statuses.set(release.id, getReleaseStatus(release));
      });
      setReleaseStatuses(statuses);
    };

    window.addEventListener("storage", handleStorageChange);
    // Also poll periodically to catch same-window changes
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const copyReviewLink = async (releaseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ensure correct basePath and trailing slash for GitHub Pages deep links
    const basePath = "/review-process"; // matches next.config.js basePath
    const url = `${window.location.origin}${basePath}/review/${releaseId}/`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedReleaseId(releaseId);
      setTimeout(() => setCopiedReleaseId(null), 2000);
    } catch {
      // Failed to copy link
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Sodic Releases Dashboard</h1>
          </div>
          <Link href="/releases/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md cursor-pointer">
            <Plus className="w-4 h-4" />
            Create New
          </Link>
        </div>

        {/* Releases List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">All Releases</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full" suppressHydrationWarning>
                  {isHydrated ? releases.length : 0} Total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  All
                </button>
                <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  Pending
                </button>
                <button onClick={() => setFilter("reviewed")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "reviewed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  Reviewed
                </button>
                <button onClick={() => setFilter("flagged")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "flagged" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  Flagged
                </button>
              </div>
            </div>
          </div>

          {releases.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No releases found</p>
              <Link href="/releases/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
                <Plus className="w-4 h-4" />
                Create Your First Release
              </Link>
            </div>
          ) : (
            (() => {
              const filteredReleases = releases.filter((release) => {
                if (!isHydrated) return true; // Show all during SSR/hydration
                const status = releaseStatuses.get(release.id);
                if (!status) return filter === "all";
                if (filter === "pending") {
                  return !status.isComplete;
                }
                if (filter === "reviewed") {
                  return status.isComplete;
                }
                if (filter === "flagged") {
                  return status.hasIssues;
                }
                return true;
              });

              if (filteredReleases.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nothing to see here!</h3>
                    <p className="text-gray-600 text-center max-w-md">No releases match your current filter. Try selecting a different filter option.</p>
                  </div>
                );
              }

              return (
                <div className="divide-y divide-gray-200">
                  {filteredReleases.map((release) => {
                    // Use default status during SSR/hydration, then use actual status
                    const defaultStatus = {
                      reviewedCount: 0,
                      totalCount: release.paymentPlans.length + release.unitDesigns.length,
                      hasIssues: false,
                      isComplete: false,
                    };
                    const status = isHydrated ? releaseStatuses.get(release.id) || defaultStatus : defaultStatus;
                    const progressPercentage = status.totalCount > 0 ? Math.round((status.reviewedCount / status.totalCount) * 100) : 0;

                    // Determine row background color
                    let rowBgClass = "bg-white";
                    if (status.isComplete) {
                      rowBgClass = "bg-green-50/40";
                    } else if (status.hasIssues) {
                      rowBgClass = "bg-red-50/40";
                    }

                    return (
                      <div key={release.id} className={`p-6 transition-colors ${rowBgClass} hover:opacity-90`}>
                        <div className="flex items-start justify-between">
                          <Link href={`/review/${release.id}/`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">{release.compoundName}</span>
                              <h3 className="text-xl font-semibold text-gray-900">{release.releaseName}</h3>
                              {status.hasIssues && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  <AlertCircle className="w-3 h-3" />
                                  Issues
                                </div>
                              )}
                              {status.isComplete && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <Check className="w-3 h-3" />
                                  Complete
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600 mt-2 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span suppressHydrationWarning>
                                  {new Date(release.releaseDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {release.unitDesigns.length} Unit Designs
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-gray-500">{release.paymentPlans.length} Payment Plans</span>
                              </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700" suppressHydrationWarning>
                                  Progress: {status.reviewedCount} / {status.totalCount} reviewed
                                </span>
                                <span className="text-xs font-medium text-gray-600" suppressHydrationWarning>
                                  {progressPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full transition-all ${status.isComplete ? "bg-green-600" : status.hasIssues ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${progressPercentage}%` }} suppressHydrationWarning />
                              </div>
                            </div>
                          </Link>
                          <div className="ml-4 flex items-center gap-2">
                            <Link href={`/review/${release.id}/history/`} onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900 relative group" aria-label="View history">
                              <History className="w-5 h-5" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                                View history
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
                              </div>
                            </Link>
                            <Link href={`/releases/new/${release.id}`} onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900 relative group" aria-label="Edit release">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                                Edit release
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
                              </div>
                            </Link>
                            <button onClick={(e) => copyReviewLink(release.id, e)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900 relative group" aria-label="Copy review link">
                              {copiedReleaseId === release.id ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                                {copiedReleaseId === release.id ? "Link copied!" : "Copy review link"}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalRelease(release);
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer text-gray-600 hover:text-red-600 relative group"
                              aria-label="Delete release"
                            >
                              <Trash2 className="w-5 h-5" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                                Delete release
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Delete Release Modal */}
        <DeleteReleaseModal
          isOpen={!!deleteModalRelease}
          onClose={() => setDeleteModalRelease(null)}
          onConfirm={() => {
            if (deleteModalRelease) {
              deleteRelease(deleteModalRelease.id);
              // Refresh releases and statuses
              const allReleases = getAllReleases();
              setReleases(allReleases);
              const statuses = new Map<string, ReleaseStatus>();
              allReleases.forEach((release) => {
                statuses.set(release.id, getReleaseStatus(release));
              });
              setReleaseStatuses(statuses);
              setDeleteModalRelease(null);
            }
          }}
          release={deleteModalRelease}
        />
      </div>
    </div>
  );
}
