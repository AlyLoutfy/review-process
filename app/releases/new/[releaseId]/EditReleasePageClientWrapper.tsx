"use client";

import EditReleasePageClient from "./EditReleasePageClient";
import { useEffect, useState } from "react";

export default function EditReleasePageClientWrapper() {
  const [releaseId, setReleaseId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for redirect from 404.html first
      const redirectPath = sessionStorage.getItem("nextjs-redirect");
      let pathToUse = window.location.pathname;
      
      console.log("[EditReleasePageClientWrapper] DEBUG - pathname:", window.location.pathname);
      console.log("[EditReleasePageClientWrapper] DEBUG - sessionStorage redirect:", redirectPath);
      
      if (redirectPath) {
        pathToUse = redirectPath.startsWith("/") ? redirectPath : "/" + redirectPath;
        sessionStorage.removeItem("nextjs-redirect");
        window.history.replaceState({}, "", pathToUse);
        console.log("[EditReleasePageClientWrapper] DEBUG - Using redirect path:", pathToUse);
      }
      
      const segments = pathToUse.split("/").filter(Boolean);
      const basePathIndex = segments.indexOf("review-process");
      const cleanSegments = basePathIndex >= 0 ? segments.slice(basePathIndex + 1) : segments;
      
      console.log("[EditReleasePageClientWrapper] DEBUG - Clean segments:", cleanSegments);
      
      const newIndex = cleanSegments.indexOf("new");
      if (newIndex >= 0 && newIndex + 1 < cleanSegments.length) {
        let id = cleanSegments[newIndex + 1].replace(/\/$/, "");
        console.log("[EditReleasePageClientWrapper] DEBUG - Extracted releaseId:", id);
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


