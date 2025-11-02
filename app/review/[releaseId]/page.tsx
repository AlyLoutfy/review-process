import ReviewPageClient from "./ReviewPageClient";

// Generate static params for static export (production builds only)
// In development, dynamic routes work without needing all routes pre-generated
export async function generateStaticParams() {
  // For static export (production), generate known routes
  // In development mode, this function is still called but dynamic routes work
  return [
    { releaseId: "june-latest" },
    { releaseId: "june-phase-2" },
  ];
}

export default async function ReviewPage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = await params;
  // ReviewPageClient will load the release from localStorage based on releaseId
  // This allows any release ID to work, even if not in generateStaticParams
  return <ReviewPageClient releaseId={releaseId} />;
}
