"use client";

import { useState, useEffect } from "react";

export function useReviewedState(releaseId: string, itemType: "payment-plan" | "unit-design") {
  const storageKey = `reviewed-${releaseId}-${itemType}`;
  
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        requestAnimationFrame(() => {
          setReviewedIds(new Set(ids));
        });
      } catch {
        // Invalid storage, start fresh
      }
    }
  }, [storageKey]);

  const toggleReviewed = (id: string) => {
    setReviewedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const isReviewed = (id: string) => reviewedIds.has(id);

  return { isReviewed, toggleReviewed, reviewedIds };
}

