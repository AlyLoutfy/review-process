"use client";

import ReleaseHistoryPageClient from "./ReleaseHistoryPageClient";
import { useEffect, useState } from "react";

export default function ReleaseHistoryPageClientWrapper() {
  const [releaseId, setReleaseId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullPath = window.location.pathname;
      const segments = fullPath.split("/").filter(Boolean);
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      
      const reviewIndex = cleanSegments.indexOf("review");
      if (reviewIndex >= 0 && reviewIndex + 1 < cleanSegments.length) {
        let id = cleanSegments[reviewIndex + 1].replace(/\/$/, "");
        if (id && id !== "fallback") {
          setReleaseId(id);
          setIsInitialized(true);
        } else {
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <ReleaseHistoryPageClient releaseId={releaseId} />;
}


