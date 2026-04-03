"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { 
  TAX_RATE, 
  FREE_SHIPPING_THRESHOLD, 
  FLAT_SHIPPING, 
  InsufficientStockError, 
  CreateOrderInputSchema,
  type CreateOrderInput
} from "./orders.schema"

export async function createOrder(data: CreateOrderInput) {
  const parsed = CreateOrderInputSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid order data: ${parsed.error.message}`)
  }

  const { customerId, items, couponCode } = parsed.data

  return prisma.$transaction(async (tx) => {
    // Check stock for all variants
    for (const item of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      })
      if (!variant || variant.stock < item.quantity) {
        throw new InsufficientStockError(item.variantId)
      }
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Apply coupon if provided
    let discount = 0
    if (couponCode) {
      const validCoupon = await tx.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })

      if (validCoupon && (validCoupon.maxUses === null || validCoupon.usedCount < validCoupon.maxUses)) {
        if (validCoupon.discountType === "PERCENTAGE") {
          discount = subtotal * (validCoupon.discountValue / 100)
        } else {
          discount = validCoupon.discountValue
        }

        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usedCount: { increment: 1 } },
        })
      }
    }

    const tax = subtotal * TAX_RATE
    const shippingCost = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
    const total = subtotal + tax + shippingCost - discount
    const orderNumber = `ORD-${Date.now()}`

    // Create order with items
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        subtotal,
        tax,
        discount,
        shippingCost,
        total,
        couponCode: couponCode ?? null,
        items: {
          createMany: {
            data: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
      include: {
        items: true,
        customer: true,
      },
    })

    // Decrement stock for each variant
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return order
  })
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
      customer: true,
    },
  })
}
