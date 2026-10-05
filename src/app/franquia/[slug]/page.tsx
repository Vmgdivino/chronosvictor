import { FranchiseView } from "@/components/franchise-view";
import { franchises, getFranchise } from "@/lib/franchises";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type FranchisePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return franchises.map((franchise) => ({ slug: franchise.slug }));
}

export async function generateMetadata({ params }: FranchisePageProps): Promise<Metadata> {
  const { slug } = await params;
  const franchise = getFranchise(slug);
  if (!franchise) return { title: "Franquia" };
  return {
    title: franchise.name,
    description: franchise.tagline,
  };
}

export default async function FranchisePage({ params }: FranchisePageProps) {
  const { slug } = await params;
  const franchise = getFranchise(slug);
  if (!franchise) notFound();
  return <FranchiseView slug={slug} />;
}
