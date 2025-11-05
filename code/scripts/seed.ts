import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create data directory if it doesn't exist
  const dataDir = join(process.cwd(), "data")
  try {
    await mkdir(dataDir, { recursive: true })
    console.log("Data directory created/verified")
  } catch (error) {
    console.log("Data directory already exists")
  }

  // Create uploads directory
  const uploadsDir = join(process.cwd(), "public", "uploads")
  try {
    await mkdir(uploadsDir, { recursive: true })
    console.log("Uploads directory created/verified")
  } catch (error) {
    console.log("Uploads directory already exists")
  }

  // Create demo image (placeholder)
  const demoImagePath = join(uploadsDir, "demo.jpg")
  try {
    // Create a simple placeholder file
    await writeFile(demoImagePath, "")
    console.log("Demo image placeholder created")
  } catch (error) {
    console.log("Demo image already exists")
  }

  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: process.env.ADMIN_EMAIL || "admin@mossi.local" },
  })

  if (!existingAdmin) {
    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10)

    const admin = await prisma.adminUser.create({
      data: {
        email: process.env.ADMIN_EMAIL || "admin@mossi.local",
        password: hashedPassword,
      },
    })
    console.log("Admin user created:", admin.email)
  } else {
    console.log("Admin user already exists:", existingAdmin.email)
  }

  // Check if demo artwork exists
  const existingArtwork = await prisma.artwork.findUnique({
    where: { code: "MOSS-0001" },
  })

  if (!existingArtwork) {
    // Create demo artwork
    const artwork = await prisma.artwork.create({
      data: {
        code: "MOSS-0001",
        name: "Forest Harmony",
        collection: "Nature Series",
        dimensions: "100 × 57 cm",
        materials: "oak frame, stabilized moss, epoxy",
        description:
          "A stunning piece featuring preserved moss in a handcrafted oak frame, bringing the tranquility of nature indoors.",
        productionDate: "2024-01-15",
        imageUrl: "/uploads/demo.jpg",
      },
    })
    console.log("Demo artwork created:", artwork.code)
  } else {
    console.log("Demo artwork already exists:", existingArtwork.code)
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
