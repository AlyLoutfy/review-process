"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, Building2, CreditCard, AlertCircle, X, Trash2 } from "lucide-react";
import { Release, PaymentPlan, UnitDesign } from "@/lib/mockData";
import { useActivityLog, ActivityType, type ActivityLog } from "@/lib/useActivityLog";

interface ReleaseHistoryPageClientProps {
  release: Release;
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

export default function ReleaseHistoryPageClient({ release }: ReleaseHistoryPageClientProps) {
  const activityLog = useActivityLog();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Get all activities for this release
    const releaseActivities = activityLog.getActivitiesByRelease(release.id);
    
    // Map activities to include the actual item
    const mappedActivities = releaseActivities
      .map((activity) => {
        let item: PaymentPlan | UnitDesign | null = null;
        
        if (activity.itemType === "payment-plan") {
          item = release.paymentPlans.find(p => p.id === activity.itemId) || null;
        } else {
          item = release.unitDesigns.find(d => d.id === activity.itemId) || null;
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
  }, [activityLog.activities, release.id]);

  // Group activities by item type
  const paymentPlanActivities = activities.filter(a => a.itemType === "payment-plan");
  const unitDesignActivities = activities.filter(a => a.itemType === "unit-design");

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
    <div
      key={`${activity.itemId}-${activity.timestamp}-${activity.activityType}`}
      className="px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-1.5 ${getActivityBgColor(activity.activityType)} rounded-lg shrink-0`}>
            {getActivityIcon(activity.activityType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900 text-base truncate">{activity.itemName}</h3>
              <span className="text-xs text-gray-500 ml-auto shrink-0">
                {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">{getActivityLabel(activity.activityType)}</span>
              <span className="text-gray-400">•</span>
              <span>by {activity.userName}</span>
              {activity.details && activity.activityType === "flagged" && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 italic truncate">"{activity.details.substring(0, 100)}{activity.details.length > 100 ? '...' : ''}"</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Reduced size */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/review/${release.id}`}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-600 hover:text-gray-900"
              title="Back to review page"
            >
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Payment Plans Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Plans</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {paymentPlanActivities.length} {paymentPlanActivities.length === 1 ? "Activity" : "Activities"}
            </span>
          </div>
          
          {paymentPlanActivities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No payment plan activities yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {paymentPlanActivities.map(renderActivityRow)}
            </div>
          )}
        </div>

        {/* Unit Designs Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Unit Designs</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {unitDesignActivities.length} {unitDesignActivities.length === 1 ? "Activity" : "Activities"}
            </span>
          </div>
          
          {unitDesignActivities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No unit design activities yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {unitDesignActivities.map(renderActivityRow)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
