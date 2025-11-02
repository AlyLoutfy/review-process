"use client";

import { useState, useEffect } from "react";

export interface ReviewRecord {
  itemId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export function useReviewedState(releaseId: string, itemType: "payment-plan" | "unit-design") {
  const storageKey = `reviewed-${releaseId}-${itemType}`;
  
  const [reviewedRecords, setReviewedRecords] = useState<Map<string, ReviewRecord>>(new Map());

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Handle multiple formats: old array format, compact format, or full format
        if (Array.isArray(data)) {
          const newMap = new Map<string, ReviewRecord>();
          
          if (data.length > 0) {
            // Check if it's the old format (just IDs)
            if (typeof data[0] === 'string') {
              // Old format - convert to new format
              data.forEach((id: string) => {
                newMap.set(id, {
                  itemId: id,
                  userId: "unknown",
                  userName: "Unknown User",
                  timestamp: new Date().toISOString(),
                });
              });
            } else if (Array.isArray(data[0]) && data[0].length === 2) {
              // Compact format: [[id, [userId, userName, timestamp]], ...]
              data.forEach((entry: [string, string[] | ReviewRecord]) => {
                const [itemId, recordData] = entry;
                if (Array.isArray(recordData)) {
                  // Compact format
                  newMap.set(itemId, {
                    itemId,
                    userId: recordData[0] || "unknown",
                    userName: recordData[1] || "Unknown User",
                    timestamp: recordData[2] || new Date().toISOString(),
                  });
                } else {
                  // Full format (fallback)
                  newMap.set(itemId, recordData as ReviewRecord);
                }
              });
            } else {
              // Full format: [[id, ReviewRecord], ...]
              data.forEach((entry: [string, ReviewRecord]) => {
                const [itemId, record] = entry;
                newMap.set(itemId, record);
              });
            }
          }
          
          requestAnimationFrame(() => {
            setReviewedRecords(newMap);
          });
        }
      } catch {
        // Invalid storage, start fresh
      }
    }
  }, [storageKey]);

  const toggleReviewed = (id: string, userId: string, userName: string) => {
    setReviewedRecords((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.set(id, {
          itemId: id,
          userId,
          userName,
          timestamp: new Date().toISOString(),
        });
      }
      try {
        // Store in compact format: [id, [userId, userName, timestamp]]
        const compactData = Array.from(newMap.entries()).map(([itemId, record]) => [
          itemId,
          [record.userId, record.userName, record.timestamp]
        ]);
        localStorage.setItem(storageKey, JSON.stringify(compactData));
      } catch (error) {
        // If quota exceeded, try to clean up and store only essential data
        try {
          // Store only userId and userName, skip timestamp
          const minimalData = Array.from(newMap.entries()).map(([itemId, record]) => [
            itemId,
            [record.userId, record.userName]
          ]);
          localStorage.setItem(storageKey, JSON.stringify(minimalData));
        } catch {
          // If still failing, clear and start fresh
          localStorage.removeItem(storageKey);
        }
      }
      return newMap;
    });
  };

  const isReviewed = (id: string) => reviewedRecords.has(id);
  
  const getReviewRecord = (id: string): ReviewRecord | null => {
    return reviewedRecords.get(id) || null;
  };

  return { isReviewed, toggleReviewed, reviewedRecords, getReviewRecord };
}

