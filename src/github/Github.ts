import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { cache } from "react";
import { getOctokitInstanse } from "./helper";

// ===== CUSTOM ERROR CLASSES =====

/**
 * Thrown when GitHub authentication fails
 * USE CASE: Token expired, not connected, etc.
 */

export class GithubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GithubAuthError";
  }
}

/**
 * Thrown when GitHub API calls fail
 * USE CASE: Rate limits, network errors, API changes
 */
export class GithubApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number, // Store HTTP status for debugging
  ) {
    super(message);
    this.name = "GithubApiError";
  }
}

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
    throw new GithubApiError("No session found. Please log in.");
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
 *
 * @returns Contribution calendar or null
 */

export async function getCurrentUserContributions() {
  try {
    const octokit = await getOctokitInstanse();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const token = await getGithubToken();

    return await fetchUserContributions(token, user.login);
  } catch (error) {
    console.error("Error in getCurrentUserContributions:", error);
    return null;
  }
}
