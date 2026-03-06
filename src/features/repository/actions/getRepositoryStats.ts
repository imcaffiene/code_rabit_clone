"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Get repository statistics
 * Used for dashboard summary
 *
 * @returns Repository statistics
 */

export const getRepositoryStats = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withPRs: 0,
        languages: [],
      };
    }

    const [total, active, withPRs, languages] = await Promise.all([
      // total repo
      prisma.repository.count({
        where: { userId: session.user.id },
      }),

      // active repo
      prisma.repository.count({
        where: { userId: session.user.id, isActive: true },
      }),

      //Repositories with pull requests
      prisma.repository.count({
        where: {
          userId: session.user.id,
          pullRequests: {
            some: {}, // Has at least 1 PR
          },
        },
      }),

      // Top 5 languages
      prisma.repository.groupBy({
        by: ["language"],
        where: {
          userId: session.user.id,
          language: { not: null },
        },
        _count: {
          language: true,
        },
        orderBy: {
          _count: {
            language: "desc",
          },
        },
        take: 5,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      withPRs,
      languages: languages.map((lang) => ({
        name: lang.language || "Unknown",
        count: lang._count.language,
      })),
    };
  } catch (error) {
    console.error("Error fetching repository stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      withPRs: 0,
      languages: [],
    };
  }
});
