import { ChaosExperience } from "@/components/experience/ChaosExperience";
import { profile } from "@/content/profile";
import { getPortfolioStats } from "@/lib/stats";

export default async function Home() {
  const stats = await getPortfolioStats(profile);

  return (
    <main>
      <ChaosExperience profile={profile} stats={stats} />
    </main>
  );
}
