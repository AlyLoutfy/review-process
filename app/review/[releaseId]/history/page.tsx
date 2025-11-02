import { notFound } from "next/navigation";
import { getReleaseById } from "@/lib/mockData";
import ReleaseHistoryPageClient from "./ReleaseHistoryPageClient";

export function generateStaticParams() {
  // Generate static params for existing releases
  return [
    { releaseId: "june-latest" },
    { releaseId: "june-phase-2" },
  ];
}

export default async function ReleaseHistoryPage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = await params;
  const release = getReleaseById(releaseId);
  
  if (!release) {
    notFound();
  }

  return <ReleaseHistoryPageClient release={release} />;
}

