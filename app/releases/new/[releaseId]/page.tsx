import EditReleasePageClient from "./EditReleasePageClient";

// Generate static params for static export
// Pre-generate routes for mock releases
// All other routes will be handled client-side
export function generateStaticParams() {
  return [{ releaseId: "june-latest" }, { releaseId: "june-phase-2" }];
}

export default async function EditReleasePage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = await params;
  return <EditReleasePageClient releaseId={releaseId} />;
}
