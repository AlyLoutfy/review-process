"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getReleaseById } from "@/lib/mockData";
import PaymentPlanCard from "@/components/PaymentPlanCard";
import UnitDesignListView from "@/components/UnitDesignViews/UnitDesignListView";
import { useReviewedState } from "@/lib/useReviewedState";
import { useIssueState } from "@/lib/useIssueState";
import { useState, useRef, useEffect } from "react";

type Section = "payment-plans" | "unit-designs";
type Filter = "all" | "reviewed" | "pending" | "flagged";

export default function ReviewPageClient({ releaseId }: { releaseId: string }) {
  const [activeSection, setActiveSection] = useState<Section>("unit-designs");
  const [filter, setFilter] = useState<Filter>("all");
  const paymentPlansTabRef = useRef<HTMLButtonElement>(null);
  const unitDesignsTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const [release, setRelease] = useState<ReturnType<typeof getReleaseById>>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Load release on client side to avoid hydration mismatch
  useEffect(() => {
    if (releaseId && typeof window !== "undefined") {
      // Use requestAnimationFrame to avoid synchronous state updates in effect
      requestAnimationFrame(() => {
        const loadedRelease = getReleaseById(releaseId);
        setRelease(loadedRelease);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentPlanState = useReviewedState(releaseId || "", "payment-plan");
  const unitDesignState = useReviewedState(releaseId || "", "unit-design");
  const paymentPlanIssues = useIssueState(releaseId || "", "payment-plan");
  const unitDesignIssues = useIssueState(releaseId || "", "unit-design");

  // Update indicator position when active section changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeRef = activeSection === "unit-designs" ? unitDesignsTabRef.current : paymentPlansTabRef.current;
      if (activeRef) {
        const { offsetLeft, offsetWidth } = activeRef;
        setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
      }
    };

    // Small delay to ensure refs are ready
    setTimeout(updateIndicator, 0);
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection]);

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

  const filteredPaymentPlans = release.paymentPlans.filter((plan) => {
    const isReviewed = paymentPlanState.isReviewed(plan.id);
    const hasIssues = paymentPlanIssues.hasIssues(plan.id);

    if (filter === "all") return true;
    if (filter === "reviewed") return isReviewed;
    if (filter === "pending") return !isReviewed && !hasIssues;
    if (filter === "flagged") return hasIssues;
    return true;
  });

  const filteredUnitDesigns = release.unitDesigns.filter((design) => {
    const isReviewed = unitDesignState.isReviewed(design.id);
    const hasIssues = unitDesignIssues.hasIssues(design.id);

    if (filter === "all") return true;
    if (filter === "reviewed") return isReviewed;
    if (filter === "pending") return !isReviewed && !hasIssues;
    if (filter === "flagged") return hasIssues;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="flex items-start justify-between gap-4 mb-2">
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
            <div className="relative border-b-2 border-gray-200">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div key={activeSection} className="animate-[fadeIn_0.3s_ease-in-out]">
            {activeSection === "payment-plans" ? (
              <div>
                {/* Filters */}
                <div className="mb-6 flex items-center gap-3 flex-wrap">
                  <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    All ({release.paymentPlans.length})
                  </button>
                  <button onClick={() => setFilter("reviewed")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "reviewed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Reviewed ({release.paymentPlans.filter((plan) => paymentPlanState.isReviewed(plan.id)).length})
                  </button>
                  <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
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
                  <button onClick={() => setFilter("flagged")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "flagged" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Flagged ({release.paymentPlans.filter((plan) => paymentPlanIssues.hasIssues(plan.id)).length})
                  </button>
                </div>

                {/* Payment Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPaymentPlans.map((plan) => {
                    const isReviewed = paymentPlanState.isReviewed(plan.id);
                    const issues = paymentPlanIssues.getIssues(plan.id);

                    return (
                      <PaymentPlanCard
                        key={plan.id}
                        plan={plan}
                        isReviewed={isReviewed}
                        onToggleReviewed={() => {
                          if (issues.length > 0) {
                            // If there are issues, show confirmation modal
                            return;
                          }
                          paymentPlanState.toggleReviewed(plan.id);
                        }}
                        hasIssues={paymentPlanIssues.hasIssues(plan.id)}
                        latestIssue={paymentPlanIssues.getLatestIssue(plan.id)}
                        onIssueSubmit={(text, file) => {
                          if (isReviewed) {
                            paymentPlanState.toggleReviewed(plan.id);
                          }
                          paymentPlanIssues.addIssue(plan.id, text, file?.name || null, file?.size || null);
                        }}
                        onResolveIssue={() => {
                          paymentPlanIssues.removeIssues(plan.id);
                          paymentPlanState.toggleReviewed(plan.id);
                        }}
                        onDeleteIssue={() => {
                          paymentPlanIssues.removeIssues(plan.id);
                        }}
                        units={release.units}
                        unitDesigns={release.unitDesigns}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                {/* Filters */}
                <div className="mb-6 flex items-center gap-3 flex-wrap">
                  <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    All ({release.unitDesigns.length})
                  </button>
                  <button onClick={() => setFilter("reviewed")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "reviewed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Reviewed ({release.unitDesigns.filter((design) => unitDesignState.isReviewed(design.id)).length})
                  </button>
                  <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
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
                  <button onClick={() => setFilter("flagged")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === "flagged" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Flagged ({release.unitDesigns.filter((design) => unitDesignIssues.hasIssues(design.id)).length})
                  </button>
                </div>

                {/* Unit Designs List */}
                <div className="space-y-6">
                  {filteredUnitDesigns.map((design) => {
                    const isReviewed = unitDesignState.isReviewed(design.id);
                    const issues = unitDesignIssues.getIssues(design.id);

                    return (
                      <UnitDesignListView
                        key={design.id}
                        unitDesign={design}
                        isReviewed={isReviewed}
                        onToggleReviewed={() => {
                          if (issues.length > 0) {
                            // If there are issues, show confirmation modal
                            return;
                          }
                          unitDesignState.toggleReviewed(design.id);
                        }}
                        hasIssues={unitDesignIssues.hasIssues(design.id)}
                        latestIssue={unitDesignIssues.getLatestIssue(design.id)}
                        onIssueSubmit={(text, file) => {
                          if (isReviewed) {
                            unitDesignState.toggleReviewed(design.id);
                          }
                          unitDesignIssues.addIssue(design.id, text, file?.name || null, file?.size || null);
                        }}
                        onResolveIssue={() => {
                          unitDesignIssues.removeIssues(design.id);
                          unitDesignState.toggleReviewed(design.id);
                        }}
                        onDeleteIssue={() => {
                          unitDesignIssues.removeIssues(design.id);
                        }}
                        units={release.units}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

