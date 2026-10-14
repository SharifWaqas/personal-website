import type { Profile } from "@/content/profile";
import { getGithubStats } from "./github";
import { getLeetCodeStats } from "./leetcode";
import type { PortfolioStats } from "./types";

export async function getPortfolioStats(
  profile: Profile,
): Promise<PortfolioStats> {
  const [github, leetcode] = await Promise.all([
    getGithubStats(profile.githubUsername),
    getLeetCodeStats(),
  ]);

  return { github, leetcode };
}

export type { PortfolioStats } from "./types";
