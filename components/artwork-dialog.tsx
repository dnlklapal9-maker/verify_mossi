"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface ArtworkDialogProps {
  open: boolean
  onClose: (refresh?: boolean) => void
  artwork?: Artwork | null
}

export function ArtworkDialog({ open, onClose, artwork }: ArtworkDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    collection: "",
    dimensions: "",
    materials: "",
    description: "",
    productionDate: "",
    imageUrl: "",
  })

  useEffect(() => {
    if (artwork) {
      setFormData({
        code: artwork.code,
        name: artwork.name,
        collection: artwork.collection || "",
        dimensions: artwork.dimensions || "",
        materials: artwork.materials || "",
        description: artwork.description || "",
        productionDate: artwork.productionDate || "",
        imageUrl: artwork.imageUrl || "",
      })
    } else {
      setFormData({
        code: "",
        name: "",
        collection: "",
        dimensions: "",
        materials: "",
        description: "",
        productionDate: "",
        imageUrl: "",
      })
    }
    setError("")
  }, [artwork, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(artwork ? `/api/artworks/${artwork.id}` : "/api/artworks", {
        method: artwork ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Nepodařilo se uložit dílo")
        setLoading(false)
        return
      }
      onClose(true)
    } catch (err) {
      setError("Došlo k chybě. Zkuste to prosím znovu.")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{artwork ? "Upravit dílo" : "Přidat nové dílo"}</DialogTitle>
          <DialogDescription>
            {artwork ? "Aktualizujte údaje o díle níže" : "Vyplňte údaje o novém díle"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... other input fields ... */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Obrázek - URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/artwork.jpg"
              disabled={loading}
              required
            />
          </div>
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>
              Zrušit
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ukládám..." : artwork ? "Aktualizovat" : "Vytvořit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}