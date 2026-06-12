"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { safeMutation, safeQuery } from "@/lib/actions/errors"
import type { OrderStatus } from "@/app/generated/prisma/client"

const ProductInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().min(1),
  images: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
})

const CategoryInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

export async function adminGetProducts() {
  const { data } = await safeQuery(
    "adminGetProducts",
    () =>
      prisma.product.findMany({
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    [],
  )
  return data
}

export async function adminGetProduct(id: string) {
  const { data } = await safeQuery(
    "adminGetProduct",
    () =>
      prisma.product.findUniqueOrThrow({
        where: { id },
        include: {
          category: true,
        },
      }),
    null,
  )
  if (!data) {
    throw new Error("Product not found.")
  }
  return data
}

export async function adminCreateProduct(data: unknown) {
  const parsed = ProductInput.parse(data)

  return safeMutation("adminCreateProduct", async () => {
    const res = await prisma.product.create({
      data: {
        ...parsed,
        slug: parsed.slug || slugify(parsed.name),
      },
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    return res
  })
}

export async function adminUpdateProduct(id: string, data: unknown) {
  const parsed = ProductInput.partial().parse(data)

  return safeMutation("adminUpdateProduct", async () => {
    const res = await prisma.product.update({
      where: { id },
      data: {
        ...parsed,
        slug: parsed.name ? slugify(parsed.name) : parsed.slug || undefined,
      },
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath(`/${res.slug}`)
    return res
  })
}

export async function adminDeleteProduct(id: string) {
  return safeMutation("adminDeleteProduct", async () => {
    const res = await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/products")
    revalidatePath("/")
    return res
  })
}

export async function adminToggleProductVisibility(id: string) {
  return safeMutation("adminToggleProductVisibility", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { id } })
    const res = await prisma.product.update({
      where: { id },
      data: { isVisible: !product.isVisible },
    })
    revalidatePath("/admin/products")
    revalidatePath("/")
    return res
  })
}

export async function adminGetOrders(status?: OrderStatus) {
  const { data } = await safeQuery(
    "adminGetOrders",
    () =>
      prisma.order.findMany({
        where: status ? { status } : undefined,
        include: {
          customer: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    [],
  )
  return data
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus) {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`)
  }
  return safeMutation("adminUpdateOrderStatus", async () => {
    const res = await prisma.order.update({ where: { id }, data: { status } })
    revalidatePath("/admin/orders")
    revalidatePath("/admin")
    revalidatePath("/orders/tracking")
    return res
  })
}

export async function adminGetCategories() {
  const { data } = await safeQuery(
    "adminGetCategories",
    () => prisma.category.findMany({ orderBy: { name: "asc" } }),
    [],
  )
  return data
}

export async function adminCreateCategory(data: unknown) {
  const parsed = CategoryInput.parse(data)
  return safeMutation("adminCreateCategory", async () => {
    const res = await prisma.category.create({
      data: {
        ...parsed,
        slug: parsed.slug || slugify(parsed.name),
      },
    })
    revalidatePath("/admin/categories")
    return res
  })
}

export async function adminUpdateCategory(id: string, data: unknown) {
  const parsed = CategoryInput.partial().parse(data)
  return safeMutation("adminUpdateCategory", async () => {
    const res = await prisma.category.update({
      where: { id },
      data: {
        ...parsed,
        slug: parsed.name ? slugify(parsed.name) : parsed.slug,
      },
    })
    revalidatePath("/admin/categories")
    return res
  })
}

export async function adminDeleteCategory(id: string) {
  return safeMutation("adminDeleteCategory", async () => {
    const res = await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
    return res
  })
}

export async function adminGetDashboardStats() {
  const { data, failed } = await safeQuery(
    "adminGetDashboardStats",
    async () => {
      const [productCount, orderCount, revenueData, recentOrders] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { customer: true },
        }),
      ])

      return {
        productCount,
        orderCount,
        totalRevenue: revenueData._sum.total || 0,
        recentOrders,
        growth: 12,
      }
    },
    {
      productCount: 0,
      orderCount: 0,
      totalRevenue: 0,
      recentOrders: [],
      growth: 0,
    },
  )

  return { ...data, failed }
}
