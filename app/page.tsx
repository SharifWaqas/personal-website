import type { Metadata } from "next";
import { PortfolioExperience } from "@/components/PortfolioExperience";
import { profile } from "@/content/profile";
import { getPortfolioStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Muhammad Sharif — Software Engineer | CS + Mathematics",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const stats = await getPortfolioStats(profile);

  return <PortfolioExperience profile={profile} stats={stats} />;
}
