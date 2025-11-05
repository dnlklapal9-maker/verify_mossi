import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params

    const artworkId = Number.parseInt(id)
    if (isNaN(artworkId)) {
      return NextResponse.json({ error: "Invalid artwork ID" }, { status: 400 })
    }

    const { code, name, collection, dimensions, materials, description, productionDate, imageUrl } = await request.json()

    if (!code || !name || !imageUrl) {
      return NextResponse.json({ error: "Code, name, and image URL are required" }, { status: 400 })
    }

    const existing = await prisma.artwork.findUnique({ where: { id: artworkId } })

    if (!existing) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    if (code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.artwork.findUnique({ where: { code: code.toUpperCase() } })
      if (codeExists) {
        return NextResponse.json({ error: "An artwork with this code already exists" }, { status: 400 })
      }
    }

    const artwork = await prisma.artwork.update({
      where: { id: artworkId },
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
    return NextResponse.json({ artwork })
  } catch (error) {
    console.error("Update artwork error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params

    const artworkId = Number.parseInt(id)
    if (isNaN(artworkId)) {
      return NextResponse.json({ error: "Invalid artwork ID" }, { status: 400 })
    }

    const existing = await prisma.artwork.findUnique({ where: { id: artworkId } })

    if (!existing) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    await prisma.artwork.delete({ where: { id: artworkId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete artwork error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
