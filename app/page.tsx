"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllReleases } from "@/lib/mockData";
import { Release } from "@/lib/mockData";
import { Plus, Calendar, Building2, Copy, Check, AlertCircle, CreditCard } from "lucide-react";

type Filter = "all" | "pending" | "reviewed" | "flagged";

interface ReleaseStatus {
  reviewedCount: number;
  totalCount: number;
  hasIssues: boolean;
  isComplete: boolean;
}

// Helper function to get release status from localStorage
const getReleaseStatus = (release: Release): ReleaseStatus => {
  if (typeof window === "undefined") {
    return { reviewedCount: 0, totalCount: 0, hasIssues: false, isComplete: false };
  }

  let reviewedCount = 0;
  let hasIssues = false;

  // Check payment plans
  const ppReviewedKey = `reviewed-${release.id}-payment-plan`;
  const ppIssuesKey = `issues-${release.id}-payment-plan`;
  try {
    const ppReviewed = localStorage.getItem(ppReviewedKey);
    if (ppReviewed) {
      const ids = JSON.parse(ppReviewed);
      reviewedCount += ids.length;
    }
    const ppIssues = localStorage.getItem(ppIssuesKey);
    if (ppIssues) {
      const issues = JSON.parse(ppIssues);
      if (issues.length > 0) hasIssues = true;
    }
  } catch {
    // Ignore errors
  }

  // Check unit designs
  const udReviewedKey = `reviewed-${release.id}-unit-design`;
  const udIssuesKey = `issues-${release.id}-unit-design`;
  try {
    const udReviewed = localStorage.getItem(udReviewedKey);
    if (udReviewed) {
      const ids = JSON.parse(udReviewed);
      reviewedCount += ids.length;
    }
    const udIssues = localStorage.getItem(udIssuesKey);
    if (udIssues) {
      const issues = JSON.parse(udIssues);
      if (issues.length > 0) hasIssues = true;
    }
  } catch {
    // Ignore errors
  }

  const totalCount = release.paymentPlans.length + release.unitDesigns.length;
  const isComplete = reviewedCount === totalCount && !hasIssues;

  return { reviewedCount, totalCount, hasIssues, isComplete };
};

export default function Home() {
  const [releases, setReleases] = useState<Release[]>(() => getAllReleases());
  const [copiedReleaseId, setCopiedReleaseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [releaseStatuses, setReleaseStatuses] = useState<Map<string, ReleaseStatus>>(() => {
    const allReleases = getAllReleases();
    const statuses = new Map<string, ReleaseStatus>();
    allReleases.forEach((release) => {
      statuses.set(release.id, getReleaseStatus(release));
    });
    return statuses;
  });

  // Initial state is set via useState initializer, useEffect only for refresh on mount
  useEffect(() => {
    // This effect runs after mount to ensure localStorage is available
    if (typeof window !== "undefined") {
      const allReleases = getAllReleases();
      // Only update if different from initial state
      if (allReleases.length !== releases.length) {
        setReleases(allReleases);
      }

      // Calculate statuses for all releases
      const statuses = new Map<string, ReleaseStatus>();
      allReleases.forEach((release) => {
        statuses.set(release.id, getReleaseStatus(release));
      });
      // Only update if different
      if (statuses.size !== releaseStatuses.size) {
        setReleaseStatuses(statuses);
      }
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

    const url = `${window.location.origin}/review/${releaseId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedReleaseId(releaseId);
      setTimeout(() => setCopiedReleaseId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link. Please try again.");
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">All Releases</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">{releases.length} Total</span>
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
            <div className="divide-y divide-gray-200">
              {releases
                .filter((release) => {
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
                })
                .map((release) => {
                  const status = releaseStatuses.get(release.id) || {
                    reviewedCount: 0,
                    totalCount: release.paymentPlans.length + release.unitDesigns.length,
                    hasIssues: false,
                    isComplete: false,
                  };
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
                        <Link href={`/review/${release.id}`} className="flex-1 cursor-pointer">
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
                              {new Date(release.releaseDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
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
                              <span className="text-xs font-medium text-gray-700">
                                Progress: {status.reviewedCount} / {status.totalCount} reviewed
                              </span>
                              <span className="text-xs font-medium text-gray-600">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${status.isComplete ? "bg-green-600" : status.hasIssues ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${progressPercentage}%` }} />
                            </div>
                          </div>
                        </Link>
                        <div className="ml-4 flex items-center gap-2">
                          <Link href={`/releases/new/${release.id}`} onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900" title="Edit release" aria-label="Edit release">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button onClick={(e) => copyReviewLink(release.id, e)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900" title="Copy review link" aria-label="Copy review link">
                            {copiedReleaseId === release.id ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
