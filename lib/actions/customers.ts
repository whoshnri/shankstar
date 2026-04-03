"use server"

import prisma from "@/lib/prisma"
import { CustomerInputSchema, type CustomerInput } from "./customers.schema"

export async function upsertCustomer(data: CustomerInput) {
  const parsed = CustomerInputSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid customer data: ${parsed.error.message}`)
  }

  const normEmail = parsed.data.email.toLowerCase().trim()
  const normPhone = parsed.data.phone.replace(/\D/g, "")

  const payload = {
    ...parsed.data,
    email: normEmail,
    phone: normPhone,
  }

  const existing = await prisma.customer.findFirst({
    where: {
      OR: [{ email: normEmail }, { phone: normPhone }],
    },
  })

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: payload,
    })
  }

  return prisma.customer.create({ data: payload })
}
