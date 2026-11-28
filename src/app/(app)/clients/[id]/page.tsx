import type { Metadata } from "next";
import { ClientDetailView } from "@/features/clients/client-detail-view";

export const metadata: Metadata = {
  title: "Client details",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}
