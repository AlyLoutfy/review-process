"use client";

import ReviewPageClient from "./ReviewPageClient";
import { useEffect, useState } from "react";

// Client wrapper that extracts releaseId from URL before rendering ReviewPageClient
// This completely bypasses Next.js route validation
export default function ReviewPageClientWrapper() {
  const [releaseId, setReleaseId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullPath = window.location.pathname;
      const segments = fullPath.split("/").filter(Boolean);
      
      // Remove basePath if present (/review-process)
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      
      // Find segment after "review"
      const reviewIndex = cleanSegments.indexOf("review");
      
      if (reviewIndex >= 0 && reviewIndex + 1 < cleanSegments.length) {
        let id = cleanSegments[reviewIndex + 1];
        id = id.replace(/\/$/, "");
        
        if (id && id !== "fallback") {
          setReleaseId(id);
          setIsInitialized(true);
        } else {
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <ReviewPageClient releaseId={releaseId} />;
}


