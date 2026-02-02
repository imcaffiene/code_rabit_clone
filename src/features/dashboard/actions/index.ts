"use server";

import { getCurrentUserContributions, GithubAuthError } from "@/github/Github";
import { getOctokitInstanse } from "@/github/helper";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { cache } from "react";

// ===== TYPE DEFINITIONS =====
export interface DashboardStats {
  totalRepo: number;
  totalContributions: number;
  totalPRs: number;
  totalAIReviews: number;
  username: string;
  avatarUrl?: string;
}

export interface MonthlyActivity {
  name: string;
  commit: number;
  prs: number;
  review: number;
}

// ===== DASHBOARD STATS =====

/**
 * Fetches comprehensive dashboard statistics
 *
 * @returns Dashboard statistics object
 */

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  try {
    // verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new GithubAuthError("No session found. Please log in.");
    }

    const octokit = await getOctokitInstanse();

    const { data: user } = await octokit.rest.users.getAuthenticated();

    const [calendar, prsResult, reposResult, aiReviewsCount] =
      await Promise.all([
        // Get contribution calendar
        getCurrentUserContributions(),

        // Count total PRs authored by user
        octokit.rest.search.issuesAndPullRequests({
          q: `author:${user.login} type:pr`,
          per_page: 1,
        }),

        // Get repository count
        octokit.rest.repos.listForAuthenticatedUser({
          per_page: 100,
        }),

        // Count AI reviews from database
        prisma.review.count({
          where: {
            userId: session.user.id,
            status: "completed",
          },
        }),
      ]);

    const repos = reposResult.data;
    const prs = prsResult.data;

    // Calculate total repo count
    const totalRepo = repos.length;

    return {
      totalRepo,
      totalContributions: calendar?.totalContributions || 0,
      totalPRs: prs.total_count,
      totalAIReviews: aiReviewsCount,
      username: user.login,
      avatarUrl: user.avatar_url,
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", {
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: error instanceof GithubAuthError ? "Auth" : "API",
      timestamp: new Date().toISOString(),
    });

    // Return safe defaults
    return {
      totalRepo: 0,
      totalContributions: 0,
      totalPRs: 0,
      totalAIReviews: 0,
      username: "Unknown",
    };
  }
});

// ===== MONTHLY ACTIVITY =====

/**
 * Fetches activity data for the last 6 months
 *
 * @returns Array of monthly activity data
 */

export async function getMonthlyActivity(): Promise<MonthlyActivity[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new GithubAuthError("No session found. Please log in.");
    }

    const octokit = await getOctokitInstanse();
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Get contribution calendar
    const calendar = await getCurrentUserContributions();

    if (!calendar) {
      console.warn("No contribution calendar available");
      return []; // Return empty instead of crashing
    }

    const monthlyData: Record<
      string,
      { commit: number; prs: number; review: number }
    > = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Create entries for last 6 months with zero values

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = { commit: 0, prs: 0, review: 0 };
    }

    //Aggregate commit data from calendar

    calendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];

        // Only count if month is in our 6-month window
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey].commit += day.contributionCount;
        }
      });
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [prsResponse, reviews] = await Promise.all([
      // Get PRs from last 6 months
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr created:>${
          sixMonthsAgo.toISOString().split("T")[0]
        }`,
        per_page: 100,
      }),

      prisma.review.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: sixMonthsAgo, // Greater than or equal to 6 months ago
          },
        },
        select: {
          createdAt: true, // Only need date
        },
      }),
    ]);

    // Aggregate PR data
    prsResponse.data.items.forEach((pr) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];

      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey].prs += 1;
      }
    });

    // Aggregate review data
    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];

      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey].review += 1;
      }
    });

    // Convert to array format for chart
    // Chart libraries expect: [{ name, commit, prs, review }, ...]
    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name],
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return [];
  }
}
