"use client";

import EditReleasePageClient from "./EditReleasePageClient";
import { useEffect, useState } from "react";

export default function EditReleasePageClientWrapper() {
  const [releaseId, setReleaseId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullPath = window.location.pathname;
      const segments = fullPath.split("/").filter(Boolean);
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      
      const newIndex = cleanSegments.indexOf("new");
      if (newIndex >= 0 && newIndex + 1 < cleanSegments.length) {
        let id = cleanSegments[newIndex + 1].replace(/\/$/, "");
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

  return <EditReleasePageClient releaseId={releaseId} />;
}


