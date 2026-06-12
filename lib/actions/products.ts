"use server";

import prisma from "@/lib/prisma";
import { safeQuery } from "@/lib/actions/errors";

const productInclude = { category: true } as const;

export async function getProducts(opts?: {
  categorySlug?: string;
  limit?: number;
  skip?: number;
  searchQuery?: string;
}) {
  const term = opts?.searchQuery?.trim();

  const { data, failed } = await safeQuery(
    "getProducts",
    () =>
      prisma.product.findMany({
        where: {
          isVisible: true,
          ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
          ...(term
            ? {
                OR: [
                  { name: { contains: term, mode: "insensitive" } },
                  { category: { name: { contains: term, mode: "insensitive" } } },
                ],
              }
            : {}),
        },
        include: productInclude,
        ...(opts?.limit ? { take: opts.limit } : {}),
        ...(opts?.skip ? { skip: opts.skip } : {}),
        orderBy: { createdAt: "desc" },
      }),
    [],
  );

  return { products: data, failed };
}

export async function getProductBySlug(slug: string) {
  const { data } = await safeQuery(
    "getProductBySlug",
    () =>
      prisma.product.findUnique({
        where: { slug },
        include: productInclude,
      }),
    null,
  );

  return data;
}

export async function getFeaturedProducts(limit = 8) {
  const { data } = await safeQuery(
    "getFeaturedProducts",
    () =>
      prisma.product.findMany({
        where: { isVisible: true },
        include: productInclude,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    [],
  );

  return data;
}

export async function getRecommendations(productId: string, limit = 4) {
  const { data: product } = await safeQuery(
    "getRecommendations:product",
    () =>
      prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true },
      }),
    null,
  );

  if (!product) return [];

  const { data } = await safeQuery(
    "getRecommendations",
    () =>
      prisma.product.findMany({
        where: {
          isVisible: true,
          categoryId: product.categoryId,
          id: { not: productId },
        },
        include: productInclude,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    [],
  );

  return data;
}

export async function getAdjacentProducts(
  productId: string,
  categoryId: string,
) {
  const { data: current } = await safeQuery(
    "getAdjacentProducts:current",
    () =>
      prisma.product.findUnique({
        where: { id: productId },
        select: { createdAt: true },
      }),
    null,
  );

  const createdAt = current?.createdAt || new Date();

  const { data } = await safeQuery(
    "getAdjacentProducts",
    () =>
      Promise.all([
        prisma.product.findFirst({
          where: {
            categoryId,
            isVisible: true,
            createdAt: { lt: createdAt },
          },
          orderBy: { createdAt: "desc" },
          select: { slug: true },
        }),
        prisma.product.findFirst({
          where: {
            categoryId,
            isVisible: true,
            createdAt: { gt: createdAt },
          },
          orderBy: { createdAt: "asc" },
          select: { slug: true },
        }),
      ]),
    [null, null] as const,
  );

  const [prev, next] = data;
  return { prevSlug: prev?.slug ?? null, nextSlug: next?.slug ?? null };
}

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

export type CategoriesResult = {
  categories: CategoryItem[];
  failed: boolean;
};

export async function getCategories(): Promise<CategoriesResult> {
  const { data, failed } = await safeQuery(
    "getCategories",
    () =>
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
    [],
  );

  return { categories: data, failed };
}

export async function getCategoryBySlug(slug: string) {
  const { data } = await safeQuery(
    "getCategoryBySlug",
    () => prisma.category.findUnique({ where: { slug } }),
    null,
  );

  return data;
}
