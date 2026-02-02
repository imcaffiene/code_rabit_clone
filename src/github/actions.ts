"use server";

import { getCurrentUserContributions } from "./Github";

/**
 * Fetch contributions for a specific year
 * @param year - Year to fetch (e.g., 2024)
 */
export async function fetchContributions(year?: number) {
  return await getCurrentUserContributions(year); 
}
