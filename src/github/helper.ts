import { cache } from "react";
import { getGithubToken } from "./Github";
import { Octokit } from "octokit";

// ===== HELPER FUNCTION =====

/**
 * Creates an authenticated Octokit instance
 *
 * @returns Authenticated Octokit client
 */

export const getOctokitInstanse = cache(async () => {
  // WHY cache: Multiple calls in one request reuse same instance

  const token = await getGithubToken();

  return new Octokit({
    auth: token,
    request: {
      timeout: 10000, // 10 seconds - prevents hanging
    },
    retry: {
      enable: true,
      retries: 2, // Retry 2 times on failure
    },
  });
});
