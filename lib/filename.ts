import { randomUUID } from "crypto"

export function generateUniqueFileName(
  originalName: string
) {
  const ext = originalName.split(".").pop()
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14) // yyyymmddhhmmss

  return `${timestamp}_${randomUUID()}.${ext}`
}
