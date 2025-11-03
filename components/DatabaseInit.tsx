"use client";

import { useEffect } from "react";
import { initDB } from "@/lib/database";

// Component to initialize IndexedDB on app startup
export default function DatabaseInit() {
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
      } catch (error) {
        // Silently fail - IndexedDB initialization errors are handled internally
      }
    };

    if (typeof window !== "undefined") {
      initialize();
    }
  }, []);

  // This component doesn't render anything
  return null;
}


