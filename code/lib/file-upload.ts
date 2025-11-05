import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomBytes } from "crypto"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"]

export async function saveUploadedFile(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit")
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only PNG and JPG are allowed")
  }

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), "public", "uploads")
  await mkdir(uploadsDir, { recursive: true })

  // Generate unique filename
  const ext = file.name.split(".").pop()
  const uniqueName = `${randomBytes(16).toString("hex")}.${ext}`
  const filePath = join(uploadsDir, uniqueName)

  // Save file
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  // Return relative URL
  return `/uploads/${uniqueName}`
}
