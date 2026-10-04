import { PortfolioExperience } from "@/components/PortfolioExperience";
import { profile } from "@/content/profile";
import { getPortfolioStats } from "@/lib/stats";

export default async function Home() {
  const stats = await getPortfolioStats(profile);

  return <PortfolioExperience profile={profile} stats={stats} />;
}
