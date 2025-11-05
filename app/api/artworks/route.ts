import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

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

    const { code, name, collection, dimensions, materials, description, productionDate, imageUrl } = await request.json()

    if (!code || !name || !imageUrl) {
      return NextResponse.json({ error: "Code, name, and image URL are required" }, { status: 400 })
    }

    const existing = await prisma.artwork.findUnique({ where: { code: code.toUpperCase() } })

    if (existing) {
      return NextResponse.json({ error: "An artwork with this code already exists" }, { status: 400 })
    }

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