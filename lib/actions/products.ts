"use server"

import prisma from "@/lib/prisma"

export async function getProducts(opts?: { categorySlug?: string; limit?: number }) {
  return prisma.product.findMany({
    where: {
      isVisible: true,
      ...(opts?.categorySlug
        ? { category: { slug: opts.categorySlug } }
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
    ...(opts?.limit ? { take: opts.limit } : {}),
    orderBy: { createdAt: "desc" },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isVisible: true },
    include: {
      brand: true,
      category: true,
      variants: {
        where: { isVisible: true },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getRecommendations(productId: string, limit = 4) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  })

  if (!product) return []

  return prisma.product.findMany({
    where: {
      isVisible: true,
      categoryId: product.categoryId,
      id: { not: productId },
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
    take: limit,
    orderBy: { createdAt: "desc" },
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}
