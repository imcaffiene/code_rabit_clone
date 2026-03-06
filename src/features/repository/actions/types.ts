// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Repository {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  owner: string;
  description?: string | null;
  language?: string | null;
  isPrivate: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    pullRequests: number;
    reviews: number;
  };
}

export interface GetRepositoriesParams {
  cursor?: string | null; // ID of last item from previous page
  limit?: number; // Number of items per page
  search?: string; // Search query
  language?: string | null; // Filter by language
  status?: "all" | "active" | "inactive"; // Filter by AI review status
  sortBy?: "updatedAt" | "createdAt" | "name" | "fullName"; // Sort field
  sortOrder?: "asc" | "desc"; // Sort direction
}

export interface GetRepositoriesResponse {
  repos: Repository[];
  nextCursor: string | null;
  hasNextPage: boolean;
  totalCount: number;
}

export interface RepositoryStatsResponse {
  total: number;
  active: number;
  inactive: number;
  withPRs: number;
  languages: Array<{
    name: string;
    count: number;
  }>;
}
