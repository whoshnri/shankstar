"use server"

import prisma from "@/lib/prisma"

export async function searchProducts(query: string) {
  const term = query.trim()

  if (term.length < 2) {
    return { results: [], recommendations: [] }
  }

  const results = await prisma.product.findMany({
    where: {
      isVisible: true,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { brand: { name: { contains: term, mode: "insensitive" } } },
        { category: { name: { contains: term, mode: "insensitive" } } },
      ],
    },
    include: {
      brand: true,
      category: true,
      variants: {
        where: { isVisible: true },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  const resultIds = results.map((p) => p.id)
  const categoryIds = [...new Set(results.map((p) => p.categoryId))]

  const recommendations = await prisma.product.findMany({
    where: {
      isVisible: true,
      id: { notIn: resultIds },
      ...(categoryIds.length > 0
        ? { categoryId: { in: categoryIds } }
        : {}),
    },
    include: {
      brand: true,
      category: true,
      variants: {
        where: { isVisible: true },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
    take: 8,
  })

  return { results, recommendations }
}
