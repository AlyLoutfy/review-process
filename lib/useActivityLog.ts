"use client";

import { useState, useEffect } from "react";

export type ActivityType = 
  | "approved" 
  | "unapproved" 
  | "flagged" 
  | "issue_resolved" 
  | "issue_deleted";

export interface ActivityLog {
  id: string;
  releaseId: string;
  itemType: "payment-plan" | "unit-design";
  itemId: string;
  itemName: string;
  activityType: ActivityType;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string; // For issue text or other details
}

const ACTIVITY_LOG_KEY = "review-process-activity-logs";

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setActivities(data);
        } catch {
          // Invalid storage, start fresh
          setActivities([]);
        }
      }
    }
  }, []);

  const addActivity = (log: Omit<ActivityLog, "id" | "timestamp">) => {
    const newActivity: ActivityLog = {
      ...log,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };

    setActivities((prev) => {
      const updated = [newActivity, ...prev]; // Most recent first
      // Keep only last 1000 activities to prevent localStorage bloat
      const limited = updated.slice(0, 1000);
      if (typeof window !== "undefined") {
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(limited));
      }
      return limited;
    });

    return newActivity;
  };

  const getActivitiesByRelease = (releaseId: string): ActivityLog[] => {
    return activities.filter((activity) => activity.releaseId === releaseId);
  };

  const getAllActivities = (): ActivityLog[] => {
    return activities;
  };

  const getActivitiesByUser = (userId: string): ActivityLog[] => {
    return activities.filter((activity) => activity.userId === userId);
  };

  const getContributors = (): { userId: string; userName: string; activityCount: number }[] => {
    const userMap = new Map<string, { userName: string; count: number }>();
    
    activities.forEach((activity) => {
      const existing = userMap.get(activity.userId);
      if (existing) {
        existing.count++;
      } else {
        userMap.set(activity.userId, {
          userName: activity.userName,
          count: 1,
        });
      }
    });

    return Array.from(userMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.userName,
        activityCount: data.count,
      }))
      .sort((a, b) => b.activityCount - a.activityCount);
  };

  return {
    addActivity,
    getActivitiesByRelease,
    getAllActivities,
    getActivitiesByUser,
    getContributors,
    activities,
  };
}

