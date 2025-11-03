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
      // DEBUG: Log all relevant information
      const debugInfo = {
        pathname: window.location.pathname,
        href: window.location.href,
        search: window.location.search,
        hash: window.location.hash,
        sessionStorageRedirect: sessionStorage.getItem("nextjs-redirect"),
      };
      
      console.log("[ReviewPageClientWrapper] DEBUG - URL Info:", JSON.stringify(debugInfo, null, 2));
      
      // Check for redirect from 404.html first
      const redirectPath = sessionStorage.getItem("nextjs-redirect");
      let pathToUse = window.location.pathname;
      
      if (redirectPath) {
        console.log("[ReviewPageClientWrapper] DEBUG - Found sessionStorage redirect:", redirectPath);
        // Use the redirect path and clear it
        pathToUse = redirectPath.startsWith("/") ? redirectPath : "/" + redirectPath;
        sessionStorage.removeItem("nextjs-redirect");
        // Update browser history to reflect the actual path
        window.history.replaceState({}, "", pathToUse);
      }
      
      console.log("[ReviewPageClientWrapper] DEBUG - Using path:", pathToUse);
      
      const segments = pathToUse.split("/").filter(Boolean);
      console.log("[ReviewPageClientWrapper] DEBUG - Segments:", segments);
      
      // Remove basePath if present (/review-process)
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      console.log("[ReviewPageClientWrapper] DEBUG - Clean segments (after basePath):", cleanSegments);
      
      // Find segment after "review"
      const reviewIndex = cleanSegments.indexOf("review");
      console.log("[ReviewPageClientWrapper] DEBUG - Review index:", reviewIndex);
      
      if (reviewIndex >= 0 && reviewIndex + 1 < cleanSegments.length) {
        let id = cleanSegments[reviewIndex + 1];
        id = id.replace(/\/$/, "");
        console.log("[ReviewPageClientWrapper] DEBUG - Extracted releaseId:", id);
        
        if (id && id !== "fallback") {
          console.log("[ReviewPageClientWrapper] DEBUG - Setting releaseId to:", id);
          setReleaseId(id);
          setIsInitialized(true);
        } else {
          console.log("[ReviewPageClientWrapper] DEBUG - ID is 'fallback' or empty, not setting releaseId");
          setIsInitialized(true);
        }
      } else {
        console.log("[ReviewPageClientWrapper] DEBUG - Could not find 'review' segment or no segment after it");
        console.log("[ReviewPageClientWrapper] DEBUG - Available segments:", cleanSegments);
        setIsInitialized(true);
      }
    } else {
      console.log("[ReviewPageClientWrapper] DEBUG - window is undefined (SSR)");
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


