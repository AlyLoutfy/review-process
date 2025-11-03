"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Client component that handles 404.html redirects globally
// This runs on every page load and redirects if needed
export default function ClientRouter() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const redirectPath = sessionStorage.getItem("nextjs-redirect");
      
      console.log("[ClientRouter] DEBUG - pathname:", pathname);
      console.log("[ClientRouter] DEBUG - redirectPath:", redirectPath);
      
      if (redirectPath) {
        console.log("[ClientRouter] DEBUG - Found redirect, clearing and navigating");
        sessionStorage.removeItem("nextjs-redirect");
        
        // Build full path with basePath
        const basePath = "/review-process";
        const fullPath = redirectPath.startsWith(basePath) ? redirectPath : basePath + redirectPath;
        
        console.log("[ClientRouter] DEBUG - Navigating to:", fullPath);
        
        // Use Next.js router for navigation
        router.push(fullPath);
      }
    }
  }, [pathname, router]);

  // This component doesn't render anything
  return null;
}

