import ReviewPageClient from "./ReviewPageClient";
import { getAllReleases } from "@/lib/mockData";

// Generate static params for static export (required by Next.js)
// In dev mode, tries to read from localStorage to include all existing releases
// At build time, uses mock releases as fallbacks
export function generateStaticParams() {
  let releaseIds: string[] = [];

  // In dev mode, try to read from localStorage if available
  if (typeof window !== "undefined") {
    try {
      const releases = getAllReleases();
      releaseIds = releases.map((r) => r.id);
    } catch {
      // If localStorage fails, use fallbacks
      releaseIds = ["june-latest", "june-phase-2"];
    }
  } else {
    // Build time - use mock releases
    releaseIds = ["june-latest", "june-phase-2"];
  }

  // Always include fallback for safety
  if (!releaseIds.includes("fallback")) {
    releaseIds.push("fallback");
  }

  // Return all release IDs - this satisfies Next.js requirements
  // In dev mode, includes all localStorage releases so no validation errors
  return releaseIds.map((id) => ({ releaseId: id }));
}

// Page component accepts params - in dev mode, params will match localStorage releases
// ReviewPageClient extracts releaseId from URL as primary source for extra safety
export default async function ReviewPage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = await params;
  // Pass param - ReviewPageClient will extract from URL pathname as primary source
  return <ReviewPageClient releaseId={releaseId} />;
}
