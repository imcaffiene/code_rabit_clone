"use server";

import { Prisma } from "@/generated/prisma/client";
import { GithubAuthError } from "@/github/errors";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import {
  GetRepositoriesParams,
  GetRepositoriesResponse,
  Repository,
} from "./types";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build where clause for Prisma query based on filters
 */

function BuildWhereClause(
  userId: string,
  params: GetRepositoriesParams,
): Prisma.RepositoryWhereInput {
  const where: Prisma.RepositoryWhereInput = {
    userId,
  };

  // Search filter (name or full name)
  if (params.search && params.search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: params.search.trim(),
          mode: "insensitive",
        },
      },
      {
        fullName: {
          contains: params.search.trim(),
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: params.search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  // Language filter
  if (params.language && params.language !== "all") {
    where.language = params.language;
  }

  // Status filter (AI review enabled/disabled)
  if (params.status && params.status !== "all") {
    where.isActive = params.status === "active";
  }

  return where;
}

/**
 * Build orderBy clause for Prisma query
 */

function BuildOrderByClause(
  params: GetRepositoriesParams,
): Prisma.RepositoryOrderByWithRelationInput {
  const sortBy = params.sortBy || "updatedAt";
  const sortOrder = params.sortOrder || "desc";

  return {
    [sortBy]: sortOrder,
  };
}

/**
 * Convert BigInt fields to strings for JSON serialization
 */

function serializeRepository(repo: any): Repository {
  return {
    ...repo,
    githubId: repo.githubId.toString(),
  };
}

// ============================================
// MAIN ACTIONS
// ============================================

/**
 * Fetch repositories with cursor-based pagination
 *
 * @param params - Query parameters (cursor, filters, sort)
 * @returns Paginated repository list
 */

export async function getRepositories(
  params: GetRepositoriesParams = {},
): Promise<GetRepositoriesResponse> {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new GithubAuthError("User not authenticated");
    }

    //set default
    const limit = params.limit || 20;
    const cursor = params.cursor || null;

    // Build Prisma query
    const where = BuildWhereClause(session.user.id, params);
    const orderBy = BuildOrderByClause(params);

    // Fetch repos (limit + 1 to check if there's a next page)
    const repos = await prisma.repository.findMany({
      where,
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        _count: {
          select: {
            pullRequests: true,
            // reviews:true
          },
        },
      },
    });

    // Determine if there's a next page
    const hasNextPage = repos.length > limit;
    const results = hasNextPage ? repos.slice(0, -1) : repos;
    const nextCursor = hasNextPage ? results[results.length - 1].id : null;

    const totalCount = await prisma.repository.count({ where });

    const serializedRepos = results.map(serializeRepository);

    return {
      repos: serializedRepos,
      nextCursor,
      hasNextPage,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching repositories:", {
      error: error instanceof Error ? error.message : "Unknown error",
      params,
      timestamp: new Date().toISOString(),
    });

    // Return empty result on error
    return {
      repos: [],
      nextCursor: null,
      hasNextPage: false,
      totalCount: 0,
    };
  }
}


