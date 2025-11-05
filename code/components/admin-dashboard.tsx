"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Plus, Pencil, Trash2, Search } from "lucide-react"
import { ArtworkDialog } from "@/components/artwork-dialog"
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
  createdAt: string
  updatedAt: string
}

interface AdminDashboardProps {
  user: {
    id: number
    email: string
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const limit = 10

  const fetchArtworks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })
      const response = await fetch(`/api/artworks?${params}`)
      const data = await response.json()

      if (response.ok) {
        setArtworks(data.artworks)
        setTotal(data.total)
      }
    } catch (error) {
      console.error("Failed to fetch artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtworks()
  }, [page, search])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat toto umělecké dílo?")) return

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchArtworks()
      } else {
        alert("Nepodařilo se smazat dílo")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Došlo k chybě")
    }
  }

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingArtwork(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false)
    setEditingArtwork(null)
    if (refresh) {
      fetchArtworks()
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Administrace</h1>
              <p className="text-muted-foreground">Přihlášen jako {user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Odhlásit se
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Umělecká díla</CardTitle>
                  <CardDescription>Spravujte certifikáty vašich uměleckých děl</CardDescription>
                </div>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat dílo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Hledat podle kódu nebo názvu..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Načítám...</div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Žádná díla nenalezena. Přidejte své první dílo.
                </div>
              ) : (
                <>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kód</TableHead>
                          <TableHead>Název</TableHead>
                          <TableHead>Kolekce</TableHead>
                          <TableHead>Rozměry</TableHead>
                          <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {artworks.map((artwork) => (
                          <TableRow key={artwork.id}>
                            <TableCell className="font-mono">{artwork.code}</TableCell>
                            <TableCell className="font-medium">{artwork.name}</TableCell>
                            <TableCell>{artwork.collection || "-"}</TableCell>
                            <TableCell>{artwork.dimensions || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(artwork)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(artwork.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Zobrazeno {(page - 1) * limit + 1} až {Math.min(page * limit, total)} z {total} děl
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Předchozí
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Další
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <ArtworkDialog open={dialogOpen} onClose={handleDialogClose} artwork={editingArtwork} />
      </div>
    </>
  )
}
