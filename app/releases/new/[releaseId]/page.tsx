import EditReleasePageClient from "./EditReleasePageClient";
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
      releaseIds = ["june-latest", "june-phase-2"];
    }
  } else {
    releaseIds = ["june-latest", "june-phase-2"];
  }
  
  if (!releaseIds.includes("fallback")) {
    releaseIds.push("fallback");
  }
  
  return releaseIds.map((id) => ({ releaseId: id }));
}

export default async function EditReleasePage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = await params;
  return <EditReleasePageClient releaseId={releaseId} />;
}
