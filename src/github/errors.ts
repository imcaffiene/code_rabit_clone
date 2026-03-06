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
