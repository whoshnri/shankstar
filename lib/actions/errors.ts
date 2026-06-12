import { InsufficientStockError } from "@/lib/actions/orders.schema";

export function actionErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const code =
      "code" in error ? String((error as { code?: string }).code) : undefined;
    const message =
      "message" in error ? String((error as { message?: string }).message) : "";

    if (
      code === "P2028" ||
      code === "P1001" ||
      code === "P1017" ||
      message.includes("EAI_AGAIN") ||
      message.includes("getaddrinfo") ||
      message.includes("Connection")
    ) {
      return "The store is temporarily unavailable. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}

export async function safeQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await query(), failed: false };
  } catch (error) {
    console.error(`[${label}]`, error);
    return { data: fallback, failed: true };
  }
}

export async function safeMutation<T>(
  label: string,
  mutation: () => Promise<T>,
): Promise<T> {
  try {
    return await mutation();
  } catch (error) {
    console.error(`[${label}]`, error);
    if (error instanceof InsufficientStockError) {
      throw error;
    }
    if (error instanceof Error && !("code" in error)) {
      throw error;
    }
    throw new Error(actionErrorMessage(error));
  }
}
