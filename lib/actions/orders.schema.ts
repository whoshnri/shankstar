import { z } from "zod"

export const TAX_RATE = 0.08
export const FREE_SHIPPING_THRESHOLD = 500000
export const FLAT_SHIPPING = 15000

export class InsufficientStockError extends Error {
  constructor(public variantId: string) {
    super(`Insufficient stock for variant: ${variantId}`)
    this.name = "InsufficientStockError"
  }
}

export const CreateOrderInputSchema = z.object({
  customerId: z.string(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number(),
    })
  ),
  couponCode: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>
