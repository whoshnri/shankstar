"use server"

import prisma from "@/lib/prisma"
import {
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  FLAT_SHIPPING,
  InsufficientStockError,
  CreateOrderInputSchema,
  type CreateOrderInput
} from "./orders.schema"
import { safeMutation } from "@/lib/actions/errors"

export async function createOrder(data: CreateOrderInput) {
  const parsed = CreateOrderInputSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid order data: ${parsed.error.message}`)
  }

  const { customerId, items, couponCode } = parsed.data

  return safeMutation("createOrder", () =>
    prisma.$transaction(
      async (tx) => {
        const productIds = items.map((item) => item.productId);

        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, stock: true, name: true },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        for (const item of items) {
          const product = productMap.get(item.productId);
          if (!product || product.stock < item.quantity) {
            throw new InsufficientStockError(product?.name || "Product");
          }
        }

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        let discount = 0;
        if (couponCode) {
          const validCoupon = await tx.coupon.findFirst({
            where: {
              code: couponCode,
              isActive: true,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          });

          if (validCoupon && (validCoupon.maxUses === null || validCoupon.usedCount < validCoupon.maxUses)) {
            if (validCoupon.discountType === "PERCENTAGE") {
              discount = subtotal * (validCoupon.discountValue / 100);
            } else {
              discount = validCoupon.discountValue;
            }

            await tx.coupon.update({
              where: { id: validCoupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        const tax = subtotal * TAX_RATE;
        const shippingCost = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
        const total = subtotal + tax + shippingCost - discount;
        const orderNumber = `ORD-${Date.now()}`;

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
        });

        await Promise.all(
          items.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            }),
          ),
        );

        return order;
      },
      {
        maxWait: 30000,
        timeout: 60000,
      },
    ),
  );
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });
  } catch (error) {
    console.error("[getOrderByNumber]", error);
    return null;
  }
}
