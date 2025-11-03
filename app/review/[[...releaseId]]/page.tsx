import ReviewPageClientWrapper from "./ReviewPageClientWrapper";

// Server component with generateStaticParams - required for static export
// This wrapper doesn't validate routes, it just provides generateStaticParams
export async function generateStaticParams() {
  console.log("[generateStaticParams] ========== CALLED AT BUILD TIME ==========");
  console.log("[generateStaticParams] This is called during build, not runtime");
  // Return fallback - client component will handle any route dynamically
  return [{ releaseId: "fallback" }];
}

// Server component that accepts params but doesn't validate them
// It immediately renders a client component that extracts from URL
export default async function ReviewPage({ params }: { params: Promise<{ releaseId: string }> }) {
  console.log("[ReviewPage Server] ========== SERVER COMPONENT RENDERED ==========");
  
  try {
    const resolvedParams = await params;
    console.log("[ReviewPage Server] Received params:", JSON.stringify(resolvedParams));
    console.log("[ReviewPage Server] Note: We're not validating this route - client will extract from URL");
  } catch (error) {
    console.error("[ReviewPage Server] Error resolving params:", error);
  }
  
  // Immediately render client component - it will extract releaseId from URL
  console.log("[ReviewPage Server] Rendering client wrapper (will extract from URL)");
  return <ReviewPageClientWrapper />;
}
