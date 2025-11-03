import ReviewPageClient from "./ReviewPageClient";

// Generate static params for static export
// Pre-generate routes for mock releases
// All other routes will be handled client-side
export function generateStaticParams() {
  return [
    { releaseId: "june-latest" },
    { releaseId: "june-phase-2" },
  ];
}

export default async function ReviewPage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = await params;
  return <ReviewPageClient releaseId={releaseId} />;
}
