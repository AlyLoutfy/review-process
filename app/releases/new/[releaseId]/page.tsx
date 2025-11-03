import EditReleasePageClientWrapper from "./EditReleasePageClientWrapper";

// Server component with generateStaticParams - required for static export
export async function generateStaticParams() {
  return [{ releaseId: "fallback" }];
}

export default async function EditReleasePage({ params }: { params: Promise<{ releaseId: string }> }) {
  return <EditReleasePageClientWrapper />;
}
