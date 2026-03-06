import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { cache } from "react";
import { getOctokitInstanse } from "./helper";
import { GithubAuthError } from "./errors";

// ===== GITHUB TOKEN RETRIEVAL =====

/**
 * Retrieves GitHub access token with request-level caching
 *
 * PRODUCTION IMPROVEMENTS:
 * 1. Uses React cache() - token only fetched once per request
 * 2. Custom error classes for better error handling
 * 3. Validates token exists before returning
 *
 * WHY cache():
 * - If multiple functions call this in one request, DB is hit only once
 * - Improves performance (fewer DB queries)
 * - Cache is cleared automatically after request finishes
 *
 * @throws {GithubAuthError} When session or token not found
 * @returns GitHub access token
 */

export const getGithubToken = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new GithubAuthError("No session found. Please log in.");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  if (!account?.accessToken) {
    throw new GithubAuthError(
      "GitHub account not connected. Please connect your GitHub account.",
    );
  }

  return account.accessToken;
});

// ===== TYPE DEFINITIONS =====

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface ContributionResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
}

/**
 * Fetches user's GitHub contribution calendar with error handling
 *
 * @param token - GitHub access token
 * @param username - GitHub username
 * @returns Contribution calendar or null if failed
 */

export async function fetchUserContributions(
  token: string,
  username: string,
): Promise<ContributionCalendar | null> {
  const octokit = new Octokit({ auth: token });

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response: ContributionResponse = await octokit.graphql(query, {
      username,
    });

    const calendar = response.user.contributionsCollection.contributionCalendar;

    if (!calendar) {
      console.error("Invalid response structure from GitHub");
      return null;
    }

    return calendar;
  } catch (error) {
    console.error("Error fetching contributions:", {
      username,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * Gets contribution calendar for the currently authenticated user
 * @param year - The year to fetch (e.g., 2024, 2025)
 */
export async function getCurrentUserContributions(year?: number) {
  try {
    const octokit = await getOctokitInstanse();
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Calculate date range for the selected year
    const targetYear = year || new Date().getFullYear();
    const fromDate = `${targetYear}-01-01T00:00:00Z`;
    const toDate = `${targetYear}-12-31T23:59:59Z`;

    // Query with date range
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;

    const response: ContributionResponse = await octokit.graphql(query, {
      username: user.login,
      from: fromDate, // Pass start date
      to: toDate, // Pass end date
    });

    const calendar = response.user.contributionsCollection.contributionCalendar;

    if (!calendar) {
      console.error("Invalid response structure from GitHub");
      return null;
    }

    return calendar;
  } catch (error) {
    console.error("Error in getCurrentUserContributions:", error);
    return null;
  }
}
