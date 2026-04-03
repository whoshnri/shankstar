"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import type { Order, OrderStatus } from "@/app/generated/prisma/client"

// ─── Schemas ────────────────────────────────────────────────────────────────

const VariantInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
})

const ProductInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).optional(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  images: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
  variants: z.array(VariantInput).optional(),
})
const BrandInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
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

// ─── Products ────────────────────────────────────────────────────────────────

export async function adminGetProducts() {
  return prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function adminGetProduct(id: string) {
  return prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      variants: true,
      brand: true,
      category: true,
    },
  })
}

export async function adminCreateProduct(data: unknown) {
  const { variants, ...parsed } = ProductInput.parse(data)
  
  const res = await prisma.product.create({
    data: {
      ...parsed,
      slug: parsed.slug || slugify(parsed.name),
      variants: variants && variants.length > 0 ? {
        create: variants.map(v => ({
          name: v.name,
          sku: v.sku!, // Non-null assertion because we'll ensure it's generated
          price: v.price,
          stock: v.stock,
          images: v.images || [],
          isVisible: v.isVisible ?? true,
        }))
      } : undefined
    },
  })
  
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return res
}

export async function adminUpdateProduct(id: string, data: unknown) {
  const { variants, ...parsed } = ProductInput.partial().parse(data)
  
  const res = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        ...parsed,
        slug: parsed.name ? slugify(parsed.name) : (parsed.slug || undefined),
      },
    })

    if (variants) {
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true }
      })
      const existingIds = existingVariants.map(v => v.id)
      const incomingIds = variants.filter(v => v.id).map(v => v.id as string)
      const idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid))

      if (idsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: idsToDelete } }
        })
      }

      const variantTasks = variants.map(v => {
        if (v.id) {
          return tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              sku: v.sku!,
              price: v.price,
              stock: v.stock,
              images: v.images || [],
              isVisible: v.isVisible ?? true,
            }
          })
        } else {
          return tx.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              sku: v.sku!,
              price: v.price,
              stock: v.stock,
              images: v.images || [],
              isVisible: v.isVisible ?? true,
            }
          })
        }
      })

      await Promise.all(variantTasks)
    }

    return product
  }, {
    maxWait: 10000,
    timeout: 30000,
  })

  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath(`/products/${res.slug}`)
  return res
}

export async function adminDeleteProduct(id: string) {
  const res = await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return res
}

export async function adminToggleProductVisibility(id: string) {
  const product = await prisma.product.findUniqueOrThrow({ where: { id } })
  const res = await prisma.product.update({
    where: { id },
    data: { isVisible: !product.isVisible },
  })
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return res
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function adminGetOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      customer: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus) {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`)
  }
  const res = await prisma.order.update({ where: { id }, data: { status } })
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  revalidatePath("/orders/tracking")
  return res
}

// ─── Brands ──────────────────────────────────────────────────────────────────

export async function adminGetBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } })
}

export async function adminCreateBrand(data: unknown) {
  const parsed = BrandInput.parse(data)
  const res = await prisma.brand.create({
    data: {
      ...parsed,
      slug: parsed.slug || slugify(parsed.name),
    },
  })
  revalidatePath("/admin/brands")
  return res
}

export async function adminUpdateBrand(id: string, data: unknown) {
  const parsed = BrandInput.partial().parse(data)
  const res = await prisma.brand.update({
    where: { id },
    data: {
      ...parsed,
      slug: parsed.name ? slugify(parsed.name) : parsed.slug,
    },
  })
  revalidatePath("/admin/brands")
  return res
}

export async function adminDeleteBrand(id: string) {
  const res = await prisma.brand.delete({ where: { id } })
  revalidatePath("/admin/brands")
  return res
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } })
}

export async function adminCreateCategory(data: unknown) {
  const parsed = CategoryInput.parse(data)
  const res = await prisma.category.create({
    data: {
      ...parsed,
      slug: parsed.slug || slugify(parsed.name),
    },
  })
  revalidatePath("/admin/categories")
  return res
}

export async function adminUpdateCategory(id: string, data: unknown) {
  const parsed = CategoryInput.partial().parse(data)
  const res = await prisma.category.update({
    where: { id },
    data: {
      ...parsed,
      slug: parsed.name ? slugify(parsed.name) : parsed.slug,
    },
  })
  revalidatePath("/admin/categories")
  return res
}

export async function adminDeleteCategory(id: string) {
  const res = await prisma.category.delete({ where: { id } })
  revalidatePath("/admin/categories")
  return res
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function adminGetDashboardStats() {
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
    growth: 12, // Placeholder for growth percentage
  }
}
