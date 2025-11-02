import ReviewPageClient from "../[releaseId]/ReviewPageClient";

// Generate static params for static export
export function generateStaticParams() {
  // Return empty array since releases are managed client-side via localStorage
  return [];
}

export default async function ReviewPage({ params }: { params: Promise<{ releaseId: string[] }> }) {
  const { releaseId } = await params;
  const releaseIdString = Array.isArray(releaseId) ? releaseId.join('/') : releaseId;
  return <ReviewPageClient releaseId={releaseIdString} />;
}

