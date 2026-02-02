"use server";

import { getCurrentUserContributions } from "./Github";

/**
 * Server action to fetch GitHub contributions
 * This wrapper allows client components to safely call server-only functions
 */
export async function fetchContributions() {
  return await getCurrentUserContributions();
}




