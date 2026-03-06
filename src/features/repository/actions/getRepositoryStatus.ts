import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Toggle AI review status for a repository
 *
 * @param repositoryId - Repository ID
 * @param isActive - New active status
 */

export async function toggleRepositoryStatus(
  repositoryId: string,
  isActive: boolean,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    //verify ownership
    const repo = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    //update status
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { isActive },
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling repository status:", error);
    return {
      success: false,
      error: "An error occurred while toggling repository status",
    };
  }
}
