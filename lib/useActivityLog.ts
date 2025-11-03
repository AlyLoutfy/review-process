"use client";

import { useState, useEffect } from "react";
import { dbActivityLog } from "./database";

export type ActivityType = 
  | "approved" 
  | "unapproved" 
  | "flagged" 
  | "issue_resolved" 
  | "issue_deleted";

export interface ActivityLog {
  id: string | number;
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

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const loadFromIndexedDB = async () => {
      if (typeof window !== "undefined") {
        try {
          const data = await dbActivityLog.getAll();
          // Convert to ActivityLog format (handle both string and number IDs)
          const formatted = data.map((activity: any) => ({
            ...activity,
            id: activity.id?.toString() || `${Date.now()}-${Math.random()}`,
          }));
          setActivities(formatted);
        } catch (error) {
          setActivities([]);
        }
      }
    };

    loadFromIndexedDB();
  }, []);

  const addActivity = async (log: Omit<ActivityLog, "id" | "timestamp">) => {
    const newActivity: ActivityLog = {
      ...log,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };

    // Save to IndexedDB
    try {
      await dbActivityLog.add(newActivity);
    } catch (error) {
      // Silently fail - errors are handled internally
    }

    setActivities((prev) => {
      const updated = [newActivity, ...prev]; // Most recent first
      // Keep only last 1000 activities in memory to prevent bloat
      return updated.slice(0, 1000);
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
