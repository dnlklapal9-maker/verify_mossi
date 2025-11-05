"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-background">
      <div className="container flex h-16 items-center justify-end px-4 md:px-8">
        <Link href="/admin/login">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Administrátor
          </Button>
        </Link>
      </div>
    </header>
  )
}
