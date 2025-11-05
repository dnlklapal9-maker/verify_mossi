import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { saveUploadedFile } from "@/lib/file-upload"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.artwork.count({ where }),
    ])

    return NextResponse.json({
      artworks,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Get artworks error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const formData = await request.formData()
    const code = formData.get("code") as string
    const name = formData.get("name") as string
    const collection = formData.get("collection") as string | null
    const dimensions = formData.get("dimensions") as string | null
    const materials = formData.get("materials") as string | null
    const description = formData.get("description") as string | null
    const productionDate = formData.get("productionDate") as string | null
    const imageFile = formData.get("image") as File | null

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json({ error: "Code and name are required" }, { status: 400 })
    }

    // Check if code already exists
    const existing = await prisma.artwork.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json({ error: "An artwork with this code already exists" }, { status: 400 })
    }

    // Handle image upload
    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await saveUploadedFile(imageFile)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to upload image" },
          { status: 400 },
        )
      }
    }

    // Create artwork
    const artwork = await prisma.artwork.create({
      data: {
        code: code.toUpperCase(),
        name,
        collection: collection || null,
        dimensions: dimensions || null,
        materials: materials || null,
        description: description || null,
        productionDate: productionDate || null,
        imageUrl,
      },
    })

    return NextResponse.json({ artwork }, { status: 201 })
  } catch (error) {
    console.error("Create artwork error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
