import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { saveUploadedFile } from "@/lib/file-upload"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params

    const artworkId = Number.parseInt(id)
    if (isNaN(artworkId)) {
      return NextResponse.json({ error: "Invalid artwork ID" }, { status: 400 })
    }

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

    // Check if artwork exists
    const existing = await prisma.artwork.findUnique({
      where: { id: artworkId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    // Check if code is taken by another artwork
    if (code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.artwork.findUnique({
        where: { code: code.toUpperCase() },
      })

      if (codeExists) {
        return NextResponse.json({ error: "An artwork with this code already exists" }, { status: 400 })
      }
    }

    // Handle image upload
    let imageUrl = existing.imageUrl
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

    // Update artwork
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

    // Check if artwork exists
    const existing = await prisma.artwork.findUnique({
      where: { id: artworkId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    // Delete artwork
    await prisma.artwork.delete({
      where: { id: artworkId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete artwork error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
