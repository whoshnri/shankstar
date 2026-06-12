"use server";

import prisma from "@/lib/prisma";
import { safeQuery } from "@/lib/actions/errors";

export async function searchProducts(query: string) {
  const term = query.trim();

  if (term.length < 2) {
    return { results: [], recommendations: [], failed: false };
  }

  const { data: results, failed: resultsFailed } = await safeQuery(
    "searchProducts:results",
    () =>
      prisma.product.findMany({
        where: {
          isVisible: true,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { category: { name: { contains: term, mode: "insensitive" } } },
          ],
        },
        include: { category: true },
        orderBy: { name: "asc" },
      }),
    [],
  );

  const resultIds = results.map((p) => p.id);
  const categoryIds = [...new Set(results.map((p) => p.categoryId))];

  const { data: recommendations, failed: recommendationsFailed } =
    await safeQuery(
      "searchProducts:recommendations",
      () =>
        prisma.product.findMany({
          where: {
            isVisible: true,
            id: { notIn: resultIds },
            ...(categoryIds.length > 0
              ? { categoryId: { in: categoryIds } }
              : {}),
          },
          include: { category: true },
          take: 8,
        }),
      [],
    );

  return {
    results,
    recommendations,
    failed: resultsFailed || recommendationsFailed,
  };
}
