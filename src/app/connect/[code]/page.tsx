import type { Metadata } from "next";
import PairPhone from "@/components/portal/PairPhone";

export const metadata: Metadata = { title: "Connect Apple Health · ANRA Health", robots: { index: false, follow: false } };

export default async function ConnectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PairPhone code={code.slice(0, 64)} />;
}
