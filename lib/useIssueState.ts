"use client";

import { useState, useEffect } from "react";
import { dbIssues } from "./database";

export interface Issue {
  id: string;
  text: string;
  fileName: string | null;
  fileSize: number | null;
  timestamp: string;
  userId: string;
  userName: string;
}

export function useIssueState(releaseId: string, itemType: "payment-plan" | "unit-design") {
  const storageKey = `issues-${releaseId}-${itemType}`;
  
  const [issues, setIssues] = useState<Map<string, Issue[]>>(new Map());

  useEffect(() => {
    const loadFromIndexedDB = async () => {
      try {
        const data = await dbIssues.get(storageKey);
        
        if (data && Array.isArray(data) && data.length > 0) {
          const newMap = new Map<string, Issue[]>();
          
          data.forEach((entry: [string, Issue[] | (string | number | null)[][]]) => {
            const [itemId, issuesData] = entry;
            
            if (Array.isArray(issuesData) && issuesData.length > 0) {
              // Check if it's compact format or full format
              if (Array.isArray(issuesData[0]) && typeof issuesData[0][0] === 'string') {
                // Compact format: [[text, fileName, fileSize, timestamp, userId, userName], ...]
                const compactIssues = issuesData as (string | number | null)[][];
                newMap.set(itemId, compactIssues.map((issueData, index) => ({
                  id: `${Date.now()}-${index}-${Math.random()}`,
                  text: (issueData[0] as string) || '',
                  fileName: (issueData[1] as string | null) || null,
                  fileSize: (typeof issueData[2] === 'number' ? issueData[2] : null) as number | null,
                  timestamp: (issueData[3] as string) || new Date().toISOString(),
                  userId: (issueData[4] as string) || 'unknown',
                  userName: (issueData[5] as string) || 'Unknown User',
                })));
              } else {
                // Full format (fallback)
                newMap.set(itemId, issuesData as Issue[]);
              }
            }
          });
          
          requestAnimationFrame(() => {
            setIssues(newMap);
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

  const addIssue = async (id: string, text: string, fileName: string | null, fileSize: number | null, userId: string, userName: string) => {
    setIssues((prev) => {
      const newMap = new Map(prev);
      const itemIssues = newMap.get(id) || [];
      
      // Limit issue history per item to prevent storage bloat (keep last 10)
      const limitedIssues = itemIssues.slice(-9);
      
      const newIssue: Issue = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        fileName,
        fileSize,
        timestamp: new Date().toISOString(),
        userId,
        userName,
      };
      newMap.set(id, [...limitedIssues, newIssue]);
      
      // Save to IndexedDB
      (async () => {
        try {
          // Store in compact format: [id, [[text, fileName, fileSize, timestamp, userId, userName], ...]]
          const compactData = Array.from(newMap.entries()).map(([itemId, issues]) => [
            itemId,
            issues.map(issue => [
              issue.text,
              issue.fileName,
              issue.fileSize,
              issue.timestamp,
              issue.userId,
              issue.userName
            ])
          ]);
          await dbIssues.set(storageKey, compactData);
        } catch (error) {
          // Silently fail - errors are handled internally
        }
      })();
      
      return newMap;
    });
  };

  const getIssues = (id: string): Issue[] => {
    return issues.get(id) || [];
  };

  const getLatestIssue = (id: string): Issue | null => {
    const itemIssues = issues.get(id);
    if (!itemIssues || itemIssues.length === 0) return null;
    // Return the most recent issue (last in array)
    return itemIssues[itemIssues.length - 1];
  };

  const hasIssues = (id: string): boolean => {
    return (issues.get(id)?.length || 0) > 0;
  };

  const removeIssues = async (id: string) => {
    setIssues((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      
      // Save to IndexedDB
      (async () => {
        try {
          // Store in compact format
          const compactData = Array.from(newMap.entries()).map(([itemId, issues]) => [
            itemId,
            issues.map(issue => [
              issue.text,
              issue.fileName,
              issue.fileSize,
              issue.timestamp,
              issue.userId,
              issue.userName
            ])
          ]);
          await dbIssues.set(storageKey, compactData);
        } catch (error) {
          // Silently fail - errors are handled internally
        }
      })();
      
      return newMap;
    });
  };

  return { addIssue, getIssues, getLatestIssue, hasIssues, removeIssues };
}
