"use client";

import Link from "next/link";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getReleaseById } from "@/lib/mockData";
import PaymentPlanCard from "@/components/PaymentPlanCard";
import UnitDesignListView from "@/components/UnitDesignViews/UnitDesignListView";
import { useReviewedState } from "@/lib/useReviewedState";
import { useIssueState } from "@/lib/useIssueState";
import { useUser } from "@/lib/useUser";
import { useActivityLog } from "@/lib/useActivityLog";
import { useState, useRef, useEffect } from "react";

type Section = "payment-plans" | "unit-designs";
type Filter = "all" | "reviewed" | "pending" | "flagged";

export default function ReviewPageClient({ releaseId }: { releaseId: string }) {
  const [activeSection, setActiveSection] = useState<Section>("unit-designs");
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const paymentPlansTabRef = useRef<HTMLButtonElement>(null);
  const unitDesignsTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const [release, setRelease] = useState<ReturnType<typeof getReleaseById>>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Load release on client side to avoid hydration mismatch
  useEffect(() => {
    console.log('[ReviewPage] useEffect running');
    console.log('[ReviewPage] releaseId:', releaseId);
    console.log('[ReviewPage] Current path:', typeof window !== "undefined" ? window.location.pathname : "N/A");
    
    if (releaseId && typeof window !== "undefined") {
      // Use requestAnimationFrame to avoid synchronous state updates in effect
      requestAnimationFrame(() => {
        console.log('[ReviewPage] Loading release from localStorage:', releaseId);
        const loadedRelease = getReleaseById(releaseId);
        console.log('[ReviewPage] Loaded release:', loadedRelease ? loadedRelease.releaseName : "NOT FOUND");
        setRelease(loadedRelease);
        setIsLoading(false);
      });
    } else {
      console.log('[ReviewPage] No releaseId or window not available');
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseId]);

  const { currentUser } = useUser();
  const activityLog = useActivityLog();
  const paymentPlanState = useReviewedState(releaseId || "", "payment-plan");
  const unitDesignState = useReviewedState(releaseId || "", "unit-design");
  const paymentPlanIssues = useIssueState(releaseId || "", "payment-plan");
  const unitDesignIssues = useIssueState(releaseId || "", "unit-design");

  // Update indicator position when active section changes or component mounts
  useEffect(() => {
    const updateIndicator = () => {
      const activeRef = activeSection === "unit-designs" ? unitDesignsTabRef.current : paymentPlansTabRef.current;
      if (activeRef) {
        const { offsetLeft, offsetWidth } = activeRef;
        setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready on initial load
    requestAnimationFrame(() => {
      updateIndicator();
    });
    
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection]);
  
  // Also update indicator when release is loaded (for initial render)
  useEffect(() => {
    if (!isLoading && release) {
      requestAnimationFrame(() => {
        const activeRef = activeSection === "unit-designs" ? unitDesignsTabRef.current : paymentPlansTabRef.current;
        if (activeRef) {
          const { offsetLeft, offsetWidth } = activeRef;
          setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
        }
      });
    }
  }, [isLoading, release, activeSection]);

  // Reset to page 1 when filter, search, or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, activeSection, itemsPerPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading release...</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Release Not Found</h1>
          <p className="text-gray-600">The release you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  // Filter and search payment plans
  const filteredPaymentPlans = release.paymentPlans.filter((plan) => {
    const isReviewed = paymentPlanState.isReviewed(plan.id);
    const hasIssues = paymentPlanIssues.hasIssues(plan.id);

    // Apply filter
    let matchesFilter = true;
    if (filter === "reviewed") matchesFilter = isReviewed;
    else if (filter === "pending") matchesFilter = !isReviewed && !hasIssues;
    else if (filter === "flagged") matchesFilter = hasIssues;

    // Apply search
    const matchesSearch = searchQuery.trim() === "" || 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Filter and search unit designs
  const filteredUnitDesigns = release.unitDesigns.filter((design) => {
    const isReviewed = unitDesignState.isReviewed(design.id);
    const hasIssues = unitDesignIssues.hasIssues(design.id);

    // Apply filter
    let matchesFilter = true;
    if (filter === "reviewed") matchesFilter = isReviewed;
    else if (filter === "pending") matchesFilter = !isReviewed && !hasIssues;
    else if (filter === "flagged") matchesFilter = hasIssues;

    // Apply search
    const matchesSearch = searchQuery.trim() === "" || 
      design.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination calculations
  const totalPaymentPlans = filteredPaymentPlans.length;
  const totalPagesPaymentPlans = Math.ceil(totalPaymentPlans / itemsPerPage);
  const paginatedPaymentPlans = filteredPaymentPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startIndexPaymentPlans = totalPaymentPlans > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndexPaymentPlans = Math.min(currentPage * itemsPerPage, totalPaymentPlans);

  const totalUnitDesigns = filteredUnitDesigns.length;
  const totalPagesUnitDesigns = Math.ceil(totalUnitDesigns / itemsPerPage);
  const paginatedUnitDesigns = filteredUnitDesigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startIndexUnitDesigns = totalUnitDesigns > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndexUnitDesigns = Math.min(currentPage * itemsPerPage, totalUnitDesigns);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-3 pb-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1.5">{release.releaseName}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full uppercase tracking-wider">{release.compoundName}</span>
                  <span>
                    Release Date:{" "}
                    <span className="font-medium text-gray-700">
                      {new Date(release.releaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              </div>
              <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md shrink-0">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Releases</span>
              </Link>
            </div>

            {/* Section Tabs - On the separator line */}
            <div className="relative border-b-2 border-gray-200 pt-2">
              <div className="flex gap-6 relative -mb-0.5">
                <button
                  ref={unitDesignsTabRef}
                  onClick={() => {
                    setActiveSection("unit-designs");
                    setFilter("all");
                  }}
                  className={`px-0 py-2.5 font-semibold text-base transition-all duration-300 relative whitespace-nowrap cursor-pointer ${activeSection === "unit-designs" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <span className="flex items-baseline gap-1.5">
                    Unit Designs
                    <span className={`text-xs font-normal px-1.5 py-0.5 rounded transition-all duration-300 ${activeSection === "unit-designs" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-400"}`}>{release.unitDesigns.length}</span>
                  </span>
                </button>
                <button
                  ref={paymentPlansTabRef}
                  onClick={() => {
                    setActiveSection("payment-plans");
                    setFilter("all");
                  }}
                  className={`px-0 py-2.5 font-semibold text-base transition-all duration-300 relative whitespace-nowrap cursor-pointer ${activeSection === "payment-plans" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <span className="flex items-baseline gap-1.5">
                    Payment Plans
                    <span className={`text-xs font-normal px-1.5 py-0.5 rounded transition-all duration-300 ${activeSection === "payment-plans" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-400"}`}>{release.paymentPlans.length}</span>
                  </span>
                </button>
                {/* Sliding indicator - appears on top of the border */}
                <div
                  className="absolute bottom-0 h-1 bg-blue-600 transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${indicatorStyle.width}px`,
                    left: `${indicatorStyle.left}px`,
                    transform: "translateY(30%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-4 pb-8">
            <div key={activeSection} className="animate-[fadeIn_0.3s_ease-in-out]">
              {activeSection === "payment-plans" ? (
                <div>
                  {/* Search and Filters */}
                  <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                    {/* Search Box */}
                    <div className="flex-1 min-w-[200px] max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search payment plans..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        All ({release.paymentPlans.length})
                      </button>
                      <button onClick={() => setFilter("reviewed")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "reviewed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        Reviewed ({release.paymentPlans.filter((plan) => paymentPlanState.isReviewed(plan.id)).length})
                      </button>
                      <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        Pending (
                        {
                          release.paymentPlans.filter((plan) => {
                            const isReviewed = paymentPlanState.isReviewed(plan.id);
                            const hasIssues = paymentPlanIssues.hasIssues(plan.id);
                            return !isReviewed && !hasIssues;
                          }).length
                        }
                        )
                      </button>
                      <button onClick={() => setFilter("flagged")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "flagged" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        Flagged ({release.paymentPlans.filter((plan) => paymentPlanIssues.hasIssues(plan.id)).length})
                      </button>
                    </div>
                  </div>

                  {/* Payment Plans Grid */}
                  {paginatedPaymentPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Nothing to see here!</h3>
                      <p className="text-gray-600 text-center max-w-md">
                        {searchQuery.trim() !== ""
                          ? `No payment plans match "${searchQuery}". Try adjusting your search or filters.`
                          : `No payment plans match your current filter. Try selecting a different filter option.`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {paginatedPaymentPlans.map((plan) => {
                    const isReviewed = paymentPlanState.isReviewed(plan.id);
                    const issues = paymentPlanIssues.getIssues(plan.id);
                    const reviewRecord = paymentPlanState.getReviewRecord(plan.id);

                    return (
                      <PaymentPlanCard
                        key={plan.id}
                        plan={plan}
                        isReviewed={isReviewed}
                        reviewRecord={reviewRecord}
                        onToggleReviewed={() => {
                          if (!currentUser) return;
                          if (issues.length > 0) {
                            // If there are issues, show confirmation modal
                            return;
                          }
                          const wasReviewed = isReviewed;
                          paymentPlanState.toggleReviewed(plan.id, currentUser.id, currentUser.name);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "payment-plan",
                              itemId: plan.id,
                              itemName: plan.name,
                              activityType: wasReviewed ? "unapproved" : "approved",
                              userId: currentUser.id,
                              userName: currentUser.name,
                            });
                          }
                        }}
                        hasIssues={paymentPlanIssues.hasIssues(plan.id)}
                        latestIssue={paymentPlanIssues.getLatestIssue(plan.id)}
                        onIssueSubmit={(text, file) => {
                          if (!currentUser) return;
                          if (isReviewed) {
                            paymentPlanState.toggleReviewed(plan.id, currentUser.id, currentUser.name);
                          }
                          paymentPlanIssues.addIssue(plan.id, text, file?.name || null, file?.size || null, currentUser.id, currentUser.name);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "payment-plan",
                              itemId: plan.id,
                              itemName: plan.name,
                              activityType: "flagged",
                              userId: currentUser.id,
                              userName: currentUser.name,
                              details: text,
                            });
                          }
                        }}
                        onResolveIssue={() => {
                          if (!currentUser) return;
                          paymentPlanIssues.removeIssues(plan.id);
                          paymentPlanState.toggleReviewed(plan.id, currentUser.id, currentUser.name);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "payment-plan",
                              itemId: plan.id,
                              itemName: plan.name,
                              activityType: "issue_resolved",
                              userId: currentUser.id,
                              userName: currentUser.name,
                            });
                          }
                        }}
                        onDeleteIssue={() => {
                          if (!currentUser) return;
                          paymentPlanIssues.removeIssues(plan.id);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "payment-plan",
                              itemId: plan.id,
                              itemName: plan.name,
                              activityType: "issue_deleted",
                              userId: currentUser.id,
                              userName: currentUser.name,
                            });
                          }
                        }}
                        units={release.units}
                        unitDesigns={release.unitDesigns}
                      />
                    );
                  })}
                    </div>
                  )}

                  {/* Pagination */}
                  {(totalPagesPaymentPlans > 1 || totalPaymentPlans > 0) && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          {totalPaymentPlans > 0 ? (
                            <>Showing {startIndexPaymentPlans}-{endIndexPaymentPlans} of {totalPaymentPlans}</>
                          ) : (
                            <>No items</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
                            Show:
                          </label>
                          <div className="relative">
                            <select
                              id="itemsPerPage"
                              value={itemsPerPage}
                              onChange={(e) => setItemsPerPage(Number(e.target.value))}
                              className="px-3 py-1.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white appearance-none"
                            >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {totalPagesPaymentPlans > 1 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              aria-label="Previous page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPagesPaymentPlans }, (_, i) => i + 1).map((page) => {
                                if (
                                  page === 1 ||
                                  page === totalPagesPaymentPlans ||
                                  (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                  return (
                                    <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                        currentPage === page
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  );
                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                  return (
                                    <span key={page} className="px-2 text-gray-500">
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            <button
                              onClick={() => setCurrentPage((prev) => Math.min(totalPagesPaymentPlans, prev + 1))}
                              disabled={currentPage === totalPagesPaymentPlans}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              aria-label="Next page"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Search and Filters */}
                  <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                    {/* Search Box */}
                    <div className="flex-1 min-w-[200px] max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search unit designs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        All ({release.unitDesigns.length})
                      </button>
                      <button onClick={() => setFilter("reviewed")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "reviewed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        Reviewed ({release.unitDesigns.filter((design) => unitDesignState.isReviewed(design.id)).length})
                      </button>
                      <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        Pending (
                        {
                          release.unitDesigns.filter((design) => {
                            const isReviewed = unitDesignState.isReviewed(design.id);
                            const hasIssues = unitDesignIssues.hasIssues(design.id);
                            return !isReviewed && !hasIssues;
                          }).length
                        }
                        )
                      </button>
                      <button onClick={() => setFilter("flagged")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "flagged" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                        Flagged ({release.unitDesigns.filter((design) => unitDesignIssues.hasIssues(design.id)).length})
                      </button>
                    </div>
                  </div>

                  {/* Unit Designs List */}
                  {paginatedUnitDesigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Nothing to see here!</h3>
                      <p className="text-gray-600 text-center max-w-md">
                        {searchQuery.trim() !== ""
                          ? `No unit designs match "${searchQuery}". Try adjusting your search or filters.`
                          : `No unit designs match your current filter. Try selecting a different filter option.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 mb-6">
                      {paginatedUnitDesigns.map((design) => {
                    const isReviewed = unitDesignState.isReviewed(design.id);
                    const issues = unitDesignIssues.getIssues(design.id);
                    const reviewRecord = unitDesignState.getReviewRecord(design.id);

                    return (
                      <UnitDesignListView
                        key={design.id}
                        unitDesign={design}
                        isReviewed={isReviewed}
                        reviewRecord={reviewRecord}
                        onToggleReviewed={() => {
                          if (!currentUser) return;
                          if (issues.length > 0) {
                            // If there are issues, show confirmation modal
                            return;
                          }
                          const wasReviewed = isReviewed;
                          unitDesignState.toggleReviewed(design.id, currentUser.id, currentUser.name);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "unit-design",
                              itemId: design.id,
                              itemName: design.name,
                              activityType: wasReviewed ? "unapproved" : "approved",
                              userId: currentUser.id,
                              userName: currentUser.name,
                            });
                          }
                        }}
                        hasIssues={unitDesignIssues.hasIssues(design.id)}
                        latestIssue={unitDesignIssues.getLatestIssue(design.id)}
                        onIssueSubmit={(text, file) => {
                          if (!currentUser) return;
                          if (isReviewed) {
                            unitDesignState.toggleReviewed(design.id, currentUser.id, currentUser.name);
                          }
                          unitDesignIssues.addIssue(design.id, text, file?.name || null, file?.size || null, currentUser.id, currentUser.name);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "unit-design",
                              itemId: design.id,
                              itemName: design.name,
                              activityType: "flagged",
                              userId: currentUser.id,
                              userName: currentUser.name,
                              details: text,
                            });
                          }
                        }}
                        onResolveIssue={() => {
                          if (!currentUser) return;
                          unitDesignIssues.removeIssues(design.id);
                          unitDesignState.toggleReviewed(design.id, currentUser.id, currentUser.name);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "unit-design",
                              itemId: design.id,
                              itemName: design.name,
                              activityType: "issue_resolved",
                              userId: currentUser.id,
                              userName: currentUser.name,
                            });
                          }
                        }}
                        onDeleteIssue={() => {
                          if (!currentUser) return;
                          unitDesignIssues.removeIssues(design.id);
                          if (release) {
                            activityLog.addActivity({
                              releaseId: release.id,
                              itemType: "unit-design",
                              itemId: design.id,
                              itemName: design.name,
                              activityType: "issue_deleted",
                              userId: currentUser.id,
                              userName: currentUser.name,
                            });
                          }
                        }}
                        units={release.units}
                      />
                    );
                  })}
                    </div>
                  )}

                  {/* Pagination */}
                  {(totalPagesUnitDesigns > 1 || totalUnitDesigns > 0) && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          {totalUnitDesigns > 0 ? (
                            <>Showing {startIndexUnitDesigns}-{endIndexUnitDesigns} of {totalUnitDesigns}</>
                          ) : (
                            <>No items</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label htmlFor="itemsPerPageUnitDesigns" className="text-sm text-gray-600 whitespace-nowrap">
                            Show:
                          </label>
                          <div className="relative">
                            <select
                              id="itemsPerPageUnitDesigns"
                              value={itemsPerPage}
                              onChange={(e) => setItemsPerPage(Number(e.target.value))}
                              className="px-3 py-1.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white appearance-none"
                            >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {totalPagesUnitDesigns > 1 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              aria-label="Previous page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPagesUnitDesigns }, (_, i) => i + 1).map((page) => {
                                if (
                                  page === 1 ||
                                  page === totalPagesUnitDesigns ||
                                  (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                  return (
                                    <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                        currentPage === page
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  );
                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                  return (
                                    <span key={page} className="px-2 text-gray-500">
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            <button
                              onClick={() => setCurrentPage((prev) => Math.min(totalPagesUnitDesigns, prev + 1))}
                              disabled={currentPage === totalPagesUnitDesigns}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              aria-label="Next page"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

