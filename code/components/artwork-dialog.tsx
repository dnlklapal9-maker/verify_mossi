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
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

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
      })
    }
    setImageFile(null)
    setError("")
  }, [artwork, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value)
      })
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      const url = artwork ? `/api/artworks/${artwork.id}` : "/api/artworks"
      const method = artwork ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kód *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="MOSS-0015"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Název *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Lesní harmonie"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection">Kolekce</Label>
            <Input
              id="collection"
              value={formData.collection}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
              placeholder="Přírodní série"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimensions">Rozměry</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="100 × 57 cm"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionDate">Datum výroby</Label>
              <Input
                id="productionDate"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                placeholder="15. ledna 2024"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materiály</Label>
            <Input
              id="materials"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="dubový rám, stabilizovaný mech, epoxid"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Úchvatné dílo s..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Obrázek (PNG/JPG, max 5MB)</Label>
            <Input
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            {artwork?.imageUrl && !imageFile && (
              <p className="text-sm text-muted-foreground">Aktuální obrázek: {artwork.imageUrl}</p>
            )}
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
