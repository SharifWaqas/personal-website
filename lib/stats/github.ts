import type { GithubStats } from "./types";

type GithubGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        totalCommitContributions?: number;
        contributionCalendar?: {
          totalContributions?: number;
        };
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const emptyStats: GithubStats = {
  commitContributions: null,
  totalContributions: null,
  periodLabel: "LAST 12 MONTHS",
};

export async function getGithubStats(
  username: string,
): Promise<GithubStats> {
  const token = process.env.GITHUB_STATS_TOKEN;

  if (!token) {
    return emptyStats;
  }

  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  const query = `
    query PortfolioGithubStats(
      $login: String!
      $from: DateTime!
      $to: DateTime!
    ) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "sharif-chaos-portfolio",
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return emptyStats;
    }

    const payload = (await response.json()) as GithubGraphQLResponse;
    const collection = payload.data?.user?.contributionsCollection;

    if (!collection || payload.errors?.length) {
      return emptyStats;
    }

    return {
      commitContributions:
        collection.totalCommitContributions ?? null,
      totalContributions:
        collection.contributionCalendar?.totalContributions ?? null,
      periodLabel: "LAST 12 MONTHS",
    };
  } catch {
    return emptyStats;
  }
}
