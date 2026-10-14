export type GithubStats = {
  commitContributions: number | null;
  totalContributions: number | null;
  periodLabel: "LAST 12 MONTHS";
};

export type LeetCodeStats = {
  totalSolved: number | null;
  easySolved: number | null;
  mediumSolved: number | null;
  hardSolved: number | null;
};

export type PortfolioStats = {
  github: GithubStats;
  leetcode: LeetCodeStats;
};
