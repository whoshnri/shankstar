"use server";

import prisma from "@/lib/prisma";
import { CustomerInputSchema, type CustomerInput } from "./customers.schema";
import { safeMutation } from "@/lib/actions/errors";

export async function upsertCustomer(data: CustomerInput) {
  const parsed = CustomerInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid customer data: ${parsed.error.message}`);
  }

  const normEmail = parsed.data.email.toLowerCase().trim();
  const normPhone = parsed.data.phone.replace(/\D/g, "");

  const payload = {
    ...parsed.data,
    email: normEmail,
    phone: normPhone,
  };

  return safeMutation("upsertCustomer", () =>
    prisma.customer.upsert({
      where: { email: normEmail },
      create: payload,
      update: payload,
    }),
  );
}
