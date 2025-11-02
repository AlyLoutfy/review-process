"use client";

import { useState, useEffect } from "react";

export interface Issue {
  id: string;
  text: string;
  fileName: string | null;
  fileSize: number | null;
  timestamp: string;
}

export function useIssueState(releaseId: string, itemType: "payment-plan" | "unit-design") {
  const storageKey = `issues-${releaseId}-${itemType}`;
  
  const [issues, setIssues] = useState<Map<string, Issue[]>>(new Map());

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIssues(new Map(data));
      } catch (e) {
        // Invalid storage, start fresh
      }
    }
  }, [storageKey]);

  const addIssue = (id: string, text: string, fileName: string | null, fileSize: number | null) => {
    setIssues((prev) => {
      const newMap = new Map(prev);
      const itemIssues = newMap.get(id) || [];
      const newIssue: Issue = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        fileName,
        fileSize,
        timestamp: new Date().toISOString(),
      };
      newMap.set(id, [...itemIssues, newIssue]);
      const serialized = Array.from(newMap.entries());
      localStorage.setItem(storageKey, JSON.stringify(serialized));
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

  const removeIssues = (id: string) => {
    setIssues((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      const serialized = Array.from(newMap.entries());
      localStorage.setItem(storageKey, JSON.stringify(serialized));
      return newMap;
    });
  };

  return { addIssue, getIssues, getLatestIssue, hasIssues, removeIssues };
}

