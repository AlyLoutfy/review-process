import ReleaseHistoryPageClientWrapper from "./ReleaseHistoryPageClientWrapper";

// Server component with generateStaticParams - required for static export
export async function generateStaticParams() {
  return [{ releaseId: "fallback" }];
}

export default async function ReleaseHistoryPage({ params }: { params: Promise<{ releaseId: string }> }) {
  return <ReleaseHistoryPageClientWrapper />;
}
