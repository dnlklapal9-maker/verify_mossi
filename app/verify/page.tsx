"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Search } from "lucide-react"
import Image from "next/image"
import { Header } from "@/components/header"

interface Artwork {
  id: number
  code: string
  name: string
  collection?: string
  dimensions?: string
  materials?: string
  description?: string
  productionDate?: string
  imageUrl?: string
}

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    valid: boolean
    artwork?: Artwork
    message?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/verify?code=${encodeURIComponent(code.trim())}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        valid: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center">
            <Image
              src="/images/mossi-logo.png"
              alt="Mossi - Preserved Nature Art"
              width={600}
              height={150}
              className="w-full max-w-2xl h-auto"
              priority
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-balance">Ověření certifikátu Mossi</h1>
            <p className="text-muted-foreground text-lg">Ověřte pravost vašeho uměleckého díla Mossi</p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Zadejte ověřovací kód</CardTitle>
              <CardDescription>Zadejte jedinečný kód uvedený na vašem certifikátu (např. MOSS-0015)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kód díla</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="MOSS-0015"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      disabled={loading}
                      className="text-lg"
                    />
                    <Button type="submit" disabled={loading} size="lg">
                      {loading ? (
                        "Ověřuji..."
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Ověřit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card className={`border-2 ${result.valid ? "border-[#93C572]" : "border-destructive"}`}>
              <CardContent className="pt-6">
                {result.valid && result.artwork ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[#93C572]">
                      <CheckCircle2 className="w-8 h-8" />
                      <div>
                        <h3 className="text-2xl font-bold">Ověřeno jako pravé</h3>
                        <p className="text-muted-foreground">Toto umělecké dílo je originální</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {result.artwork.imageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-white">
                          <Image
                            src={result.artwork.imageUrl || "/placeholder.svg"}
                            alt={result.artwork.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Název</h4>
                          <p className="text-xl font-semibold">{result.artwork.name}</p>
                        </div>

                        {result.artwork.collection && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Kolekce</h4>
                            <p className="text-lg">{result.artwork.collection}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Sériový kód</h4>
                          <p className="text-lg font-mono">{result.artwork.code}</p>
                        </div>

                        {result.artwork.dimensions && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Rozměry</h4>
                            <p className="text-lg">{result.artwork.dimensions}</p>
                          </div>
                        )}

                        {result.artwork.materials && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Materiály</h4>
                            <p className="text-lg">{result.artwork.materials}</p>
                          </div>
                        )}

                        {result.artwork.productionDate && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Datum výroby</h4>
                            <p className="text-lg">{result.artwork.productionDate}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {result.artwork.description && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Popis</h4>
                        <p className="text-base leading-relaxed">{result.artwork.description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-destructive">
                    <XCircle className="w-8 h-8" />
                    <div>
                      <h3 className="text-2xl font-bold">Nenalezeno</h3>
                      <p className="text-muted-foreground">
                        {result.message || "Neplatný kód nebo dílo nebylo nalezeno"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
