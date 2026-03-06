"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Get unique languages from user's repositories
 * Used for language filter dropdown
 *
 * @returns Array of language names
 */

export const getRepositoryLanguages = cache(async (): Promise<string[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return [];
    }

    // get distinct languages
    const languages = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
        language: {
          not: null, // ← Skip repos with no language
        },
      },
      select: {
        language: true,
      },
      distinct: ["language"],
      orderBy: {
        language: "asc",
      },
    });

    return languages
      .map((repo) => repo.language)
      .filter((lang): lang is string => lang !== null);
  } catch (error) {
    console.error("Error fetching repository languages:", error);
    return [];
  }
});
