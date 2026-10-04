import type { LeetCodeStats } from "./types";

type SubmissionCount = {
  difficulty: string;
  count: number;
  submissions: number;
};

type LeetCodeGraphQLResponse = {
  data?: {
    matchedUser?: {
      submitStatsGlobal?: {
        acSubmissionNum?: SubmissionCount[];
      };
    } | null;
  };
};

const emptyStats: LeetCodeStats = {
  totalSolved: null,
  easySolved: null,
  mediumSolved: null,
  hardSolved: null,
};

export async function getLeetCodeStats(): Promise<LeetCodeStats> {
  const username = process.env.LEETCODE_USERNAME;

  if (!username) {
    return emptyStats;
  }

  const query = `
    query UserProfileSolvedCounts($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/u/${username}/`,
        "User-Agent": "sharif-chaos-portfolio",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return emptyStats;
    }

    const payload = (await response.json()) as LeetCodeGraphQLResponse;
    const counts =
      payload.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;

    if (!counts) {
      return emptyStats;
    }

    const byDifficulty = Object.fromEntries(
      counts.map((item) => [item.difficulty, item.count]),
    );

    return {
      totalSolved: byDifficulty.All ?? null,
      easySolved: byDifficulty.Easy ?? null,
      mediumSolved: byDifficulty.Medium ?? null,
      hardSolved: byDifficulty.Hard ?? null,
    };
  } catch {
    return emptyStats;
  }
}
