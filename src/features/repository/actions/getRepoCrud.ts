"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Repository } from "./types";

/**
 * Convert BigInt fields to strings for JSON serialization
 */
function serializeRepository(repo: any): Repository {
  return {
    ...repo,
    githubId: repo.githubId.toString(), // Convert BigInt to string
  };
}

/**
 * Delete a repository from the system
 * Note: This doesn't delete from GitHub, only from our database
 *
 * @param repositoryId - Repository ID
 */

export async function deleteRepository(
  repositoryId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const repo = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      return { success: false, error: "Repository not found" };
    }

    // Delete repository (cascade deletes PRs, reviews, etc.)
    await prisma.repository.delete({
      where: { id: repositoryId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting repository:", error);
    return { success: false, error: "Failed to delete repository" };
  }
}

/**
 * Get a single repository by ID
 *
 * @param repositoryId - Repository ID
 */
export async function getRepositoryById(
  repositoryId: string,
): Promise<Repository | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const repo = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            pullRequests: true,
            // reviews: true,
          },
        },
      },
    });

    if (!repo) {
      return null;
    }

    return serializeRepository(repo);
  } catch (error) {
    console.error("Error fetching repository:", error);
    return null;
  }
}
