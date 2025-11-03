import ReviewPageClient from "./ReviewPageClient";

// Using optional catch-all route [[...slug]] to handle any releaseId without validation errors
// This allows ANY route to work, including newly created releases
export function generateStaticParams() {
  // Return empty array - optional catch-all doesn't require pre-generation
  // All routes work via client-side URL extraction
  return [];
}

// Page component extracts releaseId from slug array or URL
export default function ReviewPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  // ReviewPageClient extracts releaseId from URL pathname - slug is not needed
  return <ReviewPageClient releaseId="" />;
}
