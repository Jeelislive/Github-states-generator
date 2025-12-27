import { Octokit } from "@octokit/rest";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Optional: Add token for higher rate limits
});

export interface GitHubStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  totalForks: number;
  totalReviews: number;
  totalDiscussions: number;
  prsMerged: number;
  prsMergedPercentage: number;
}

export interface LanguageStats {
  [language: string]: number;
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalContributions: number;
}

async function getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }
  const data = await fetchFn();
  cache.set(key, data);
  return data;
}

export async function getUserStats(username: string): Promise<GitHubStats> {
  return getCachedOrFetch(`stats:${username}`, async () => {
    // Get user info and initial repos
    const [user, prs, issues] = await Promise.all([
      octokit.rest.users.getByUsername({ username }),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr`,
        per_page: 1,
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:issue`,
        per_page: 1,
      }),
    ]);

    // Get all repos with pagination
    let allRepos: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const repos = await octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        page,
        sort: "updated",
      });
      allRepos = allRepos.concat(repos.data);
      hasMore = repos.data.length === 100;
      page++;
      if (page > 10) break; // Limit to 1000 repos max
    }

    let totalStars = 0;
    let totalForks = 0;

    // Get stats from all repos
    for (const repo of allRepos) {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
    }

    // Get PR reviews
    const reviews = await octokit.rest.search.issuesAndPullRequests({
      q: `reviewed-by:${username} type:pr`,
      per_page: 1,
    });

    // Get discussions
    const discussions = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${username} type:discussion`,
      per_page: 1,
    });

    // Get merged PRs
    const mergedPRs = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${username} type:pr is:merged`,
      per_page: 1,
    });

    const totalPRs = prs.data.total_count || 0;
    const totalIssues = issues.data.total_count || 0;
    const totalReviews = reviews.data.total_count || 0;
    const totalDiscussions = discussions.data.total_count || 0;
    const prsMerged = mergedPRs.data.total_count || 0;
    const prsMergedPercentage = totalPRs > 0 ? Math.round((prsMerged / totalPRs) * 100) : 0;

    // Approximate commits (GitHub API doesn't provide exact count easily)
    // Using a simplified approach based on repos and activity
    const totalCommits = Math.floor(allRepos.length * 15 + totalPRs * 3 + totalIssues * 2);

    return {
      totalCommits,
      totalPRs,
      totalIssues,
      totalStars,
      totalForks,
      totalReviews,
      totalDiscussions,
      prsMerged,
      prsMergedPercentage,
    };
  });
}

export async function getLanguageStats(username: string): Promise<LanguageStats> {
  return getCachedOrFetch(`languages:${username}`, async () => {
    // Get all repos with pagination
    let allRepos: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const repos = await octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        page,
        sort: "updated",
      });
      allRepos = allRepos.concat(repos.data);
      hasMore = repos.data.length === 100;
      page++;
      if (page > 10) break; // Limit to 1000 repos max
    }

    const languages: LanguageStats = {};

    for (const repo of allRepos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }

    return languages;
  });
}

export async function getStreakStats(username: string): Promise<StreakStats> {
  return getCachedOrFetch(`streak:${username}`, async () => {
    // Get user events to estimate contributions
    const [repos, prs, issues] = await Promise.all([
      octokit.rest.repos.listForUser({ username, per_page: 100 }),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr`,
        per_page: 1,
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:issue`,
        per_page: 1,
      }),
    ]);

    // Estimate total contributions based on activity
    const totalContributions = (prs.data.total_count || 0) + (issues.data.total_count || 0) + repos.data.length * 5;

    // Note: GitHub doesn't provide direct streak API
    // These are estimates based on activity patterns
    // For production, consider using GitHub's contribution graph scraping
    const activityLevel = Math.min(totalContributions / 100, 1);
    const currentStreak = Math.max(1, Math.floor(activityLevel * 30));
    const bestStreak = Math.max(currentStreak, Math.floor(activityLevel * 100));

    return {
      currentStreak,
      bestStreak,
      totalContributions,
    };
  });
}

