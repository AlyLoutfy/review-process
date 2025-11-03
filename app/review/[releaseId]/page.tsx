import ReviewPageClientWrapper from "./ReviewPageClientWrapper";

// Generate static params - required for static export in production
export async function generateStaticParams() {
  return [{ releaseId: "fallback" }];
}

// Server component
export default async function ReviewPage({ params }: { params: Promise<{ releaseId: string }> }) {
  return <ReviewPageClientWrapper />;
}

// NOTE: dynamicParams cannot be used with output: "export"
// Instead, we use client-side extraction to bypass validation
