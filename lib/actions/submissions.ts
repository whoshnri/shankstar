"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function subscribeToMailingList(formData: FormData) {
  const email = formData.get("email") as string
  const name = formData.get("name") as string

  if (!email || !email.includes("@")) {
    return { error: "Invalid email address" }
  }

  try {
    await prisma.mailingList.upsert({
      where: { email: email.toLowerCase() },
      update: { name },
      create: { 
        email: email.toLowerCase(),
        name 
      },
    })
    return { success: true }
  } catch (error) {
    console.error("Mailing list error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  if (!email || !email.includes("@") || !message) {
    return { error: "Invalid data. Email and message are required." }
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        name,
        email: email.toLowerCase(),
        subject,
        message,
      },
    })
    return { success: true }
  } catch (error) {
    console.error("Contact submission error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function getMailingList() {
  return prisma.mailingList.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteMailingListEntry(id: string) {
  try {
    await prisma.mailingList.delete({ where: { id } })
    revalidatePath("/admin/mailing-list")
    return { success: true }
  } catch (error) {
    console.error("Delete mailing list error:", error)
    return { error: "Failed to delete entry." }
  }
}

export async function deleteContactSubmission(id: string) {
  try {
    await prisma.contactSubmission.delete({ where: { id } })
    revalidatePath("/admin/contacts")
    return { success: true }
  } catch (error) {
    console.error("Delete contact submission error:", error)
    return { error: "Failed to delete submission." }
  }
}


export async function getContactFormSubmissions(){
  try{
    return await prisma.contactSubmission.findMany()
  }catch(error){
    return null
  }
}