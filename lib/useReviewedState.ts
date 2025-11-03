"use client";

import { useState, useEffect } from "react";
import { dbReviewed } from "./database";

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
    const loadFromIndexedDB = async () => {
      try {
        const data = await dbReviewed.get(storageKey);
        
        if (data && Array.isArray(data)) {
          const newMap = new Map<string, ReviewRecord>();
          
          if (data.length > 0) {
            // Compact format: [[id, [userId, userName, timestamp]], ...]
            if (Array.isArray(data[0]) && data[0].length === 2) {
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
      } catch (error) {
        // Silently fail - errors are handled internally
      }
    };

    if (typeof window !== "undefined") {
      loadFromIndexedDB();
    }
  }, [storageKey]);

  const toggleReviewed = async (id: string, userId: string, userName: string) => {
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
      
      // Save to IndexedDB
      (async () => {
        try {
          // Store in compact format: [id, [userId, userName, timestamp]]
          const compactData = Array.from(newMap.entries()).map(([itemId, record]) => [
            itemId,
            [record.userId, record.userName, record.timestamp]
          ]);
          await dbReviewed.set(storageKey, compactData);
        } catch (error) {
          // Silently fail - errors are handled internally
        }
      })();
      
      return newMap;
    });
  };

  const isReviewed = (id: string) => reviewedRecords.has(id);
  
  const getReviewRecord = (id: string): ReviewRecord | null => {
    return reviewedRecords.get(id) || null;
  };

  return { isReviewed, toggleReviewed, reviewedRecords, getReviewRecord };
}

