"use client";

import ReleaseHistoryPageClient from "./ReleaseHistoryPageClient";
import { useEffect, useState } from "react";

export default function ReleaseHistoryPageClientWrapper() {
  const [releaseId, setReleaseId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for redirect from 404.html first
      const redirectPath = sessionStorage.getItem("nextjs-redirect");
      let pathToUse = window.location.pathname;
      
      console.log("[ReleaseHistoryPageClientWrapper] DEBUG - pathname:", window.location.pathname);
      console.log("[ReleaseHistoryPageClientWrapper] DEBUG - sessionStorage redirect:", redirectPath);
      
      if (redirectPath) {
        pathToUse = redirectPath.startsWith("/") ? redirectPath : "/" + redirectPath;
        sessionStorage.removeItem("nextjs-redirect");
        window.history.replaceState({}, "", pathToUse);
        console.log("[ReleaseHistoryPageClientWrapper] DEBUG - Using redirect path:", pathToUse);
      }
      
      const segments = pathToUse.split("/").filter(Boolean);
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      
      console.log("[ReleaseHistoryPageClientWrapper] DEBUG - Clean segments:", cleanSegments);
      
      const reviewIndex = cleanSegments.indexOf("review");
      if (reviewIndex >= 0 && reviewIndex + 1 < cleanSegments.length) {
        let id = cleanSegments[reviewIndex + 1].replace(/\/$/, "");
        console.log("[ReleaseHistoryPageClientWrapper] DEBUG - Extracted releaseId:", id);
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


