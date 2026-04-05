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
    // 1. Collect all IDs for batch lookup
    const variantIds = items.filter(i => i.variantId).map(i => i.variantId as string);
    const productIds = items.map(i => i.productId);

    // 2. Fetch variants and products in parallel
    const [variants, products] = await Promise.all([
      tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, stock: true, name: true },
      }),
      tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true },
      }),
    ]);

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Stock Checks
    for (const item of items) {
      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.stock < item.quantity) {
          throw new InsufficientStockError(variant?.name || 'Unknown Variant');
        }
      } else {
        const product = productMap.get(item.productId);
        if (!product || product.stock < item.quantity) {
          throw new InsufficientStockError(product?.name || 'Default Product');
        }
      }
    }

    // 4. Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // 5. Apply coupon if provided
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

    // 6. Create order with items
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
              productId: item.productId,
              variantId: item.variantId || null,
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

    // 7. Decrement stock (Independent logic)
    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return order
  }, {
    maxWait: 10000,
    timeout: 15000,
  })
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      customer: true,
    },
  })
}
