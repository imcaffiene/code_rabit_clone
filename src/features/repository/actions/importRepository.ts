"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOctokitInstanse } from "@/github/helper";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
  html_url: string;
  isImported?: boolean;
}

/**
 * Fetch all GitHub repositories without caching (caching happens at request level)
 */
export async function fetchGitHubRepositories(userId: string): Promise<{
  success: boolean;
  repos: GitHubRepository[];
  error?: string;
}> {
  try {
    const octokit = await getOctokitInstanse();

    console.time("⏱️ Fetch GitHub repos");

    // Parallel fetching
    const [githubReposResponse, importedReposResponse] = await Promise.all([
      // Fetch from GitHub API
      octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: "updated",
        affiliation: "owner,collaborator,organization_member",
      }),

      // Fetch imported repos from DB (in parallel)
      prisma.repository.findMany({
        where: { userId },
        select: { githubId: true },
      }),
    ]);

    console.timeEnd("⏱️ Fetch GitHub repos");

    const githubRepos = githubReposResponse.data;
    const importedRepos = importedReposResponse;

    // Single Set creation (O(n) instead of O(n²))
    const importedIds = new Set(
      importedRepos.map((r) => r.githubId.toString()),
    );

    // Map instead of filter + map
    const reposWithStatus = githubRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      html_url: repo.html_url,
      isImported: importedIds.has(repo.id.toString()),
    }));

    console.log(
      `Fetched ${githubRepos.length} repos (${importedRepos.length} already imported)`,
    );

    return {
      success: true,
      repos: reposWithStatus,
    };
  } catch (error) {
    console.error("❌ Error fetching GitHub repos:", error);
    return {
      success: false,
      repos: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Wrapper to call cached function with userId
 */
export async function fetchGitHubRepositoriesAction(): Promise<{
  success: boolean;
  repos: GitHubRepository[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.error("❌ No session found");
      return { success: false, repos: [], error: "Unauthorized - No session" };
    }

    console.log("📝 Session found, fetching repos for user:", session.user.id);
    const result = await fetchGitHubRepositories(session.user.id);

    if (!result.success) {
      console.error("❌ fetchGitHubRepositories failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("❌ Error in fetchGitHubRepositoriesAction:", error);
    return {
      success: false,
      repos: [],
      error:
        error instanceof Error
          ? error.message
          : "Unknown error in action wrapper",
    };
  }
}

/**
 * Import a single repository
 */
export async function importSingleRepository(repoId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    console.time(`⏱️ Import repo ${repoId}`);

    const octokit = await getOctokitInstanse();

    // Check existence before fetching
    const existing = await prisma.repository.findUnique({
      where: { githubId: BigInt(repoId) },
      select: { id: true }, // Only select ID (faster)
    });

    if (existing) {
      console.timeEnd(`⏱️ Import repo ${repoId}`);
      return { success: false, error: "Repository already imported" };
    }

    // Fetch repo details from GitHub
    const { data: repoData } = await octokit.request("GET /repositories/{id}", {
      id: repoId,
    });

    // Create repository in database
    await prisma.repository.create({
      data: {
        userId: session.user.id,
        githubId: BigInt(repoData.id),
        name: repoData.name,
        fullName: repoData.full_name,
        owner: repoData.owner.login,
        description: repoData.description,
        language: repoData.language,
        isPrivate: repoData.private,
        isActive: false,
      },
    });

    console.timeEnd(`⏱️ Import repo ${repoId}`);
    console.log(`✅ Imported: ${repoData.full_name}`);

    // Invalidate cache after import
    // revalidateTag("github-repos"); // Uncomment if using Next.js 14+

    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to import repo ${repoId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Bulk import (much faster for multiple repos)
 */
export async function importMultipleRepositories(repoIds: number[]): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, imported: 0, failed: 0, error: "Unauthorized" };
    }

    console.time(`⏱️ Bulk import ${repoIds.length} repos`);

    const octokit = await getOctokitInstanse();

    // Fetch existing repos in one query
    const existing = await prisma.repository.findMany({
      where: {
        githubId: { in: repoIds.map((id) => BigInt(id)) },
      },
      select: { githubId: true },
    });

    const existingIds = new Set(existing.map((r) => Number(r.githubId)));
    const toImport = repoIds.filter((id) => !existingIds.has(id));

    console.log(
      `📦 Importing ${toImport.length} new repos (${existingIds.size} already exist)`,
    );

    // Fetch repo details in parallel (max 5 at a time to avoid rate limits)
    const BATCH_SIZE = 5;
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
      const batch = toImport.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (repoId) => {
          const { data: repoData } = await octokit.request(
            "GET /repositories/{id}",
            {
              id: repoId,
            },
          );

          return prisma.repository.create({
            data: {
              userId: session.user.id,
              githubId: BigInt(repoData.id),
              name: repoData.name,
              fullName: repoData.full_name,
              owner: repoData.owner.login,
              description: repoData.description,
              language: repoData.language,
              isPrivate: repoData.private,
              isActive: false,
            },
          });
        }),
      );

      results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          imported++;
          console.log(`✅ Imported: ${result.value.fullName}`);
        } else {
          failed++;
          console.error(
            `❌ Failed to import repo ${batch[idx]}:`,
            result.reason,
          );
        }
      });
    }

    console.timeEnd(`⏱️ Bulk import ${repoIds.length} repos`);

    return {
      success: true,
      imported,
      failed,
    };
  } catch (error) {
    console.error("❌ Error in bulk import:", error);
    return {
      success: false,
      imported: 0,
      failed: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
