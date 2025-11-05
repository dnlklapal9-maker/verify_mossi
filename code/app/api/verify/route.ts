import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ valid: false, error: "Code parameter is required" }, { status: 400 })
    }

    const artwork = await prisma.artwork.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        name: true,
        collection: true,
        dimensions: true,
        materials: true,
        description: true,
        productionDate: true,
        imageUrl: true,
      },
    })

    if (!artwork) {
      return NextResponse.json({
        valid: false,
        message: "Invalid code or artwork not found",
      })
    }

    return NextResponse.json({
      valid: true,
      artwork,
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 })
  }
}
