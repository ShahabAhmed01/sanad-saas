"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function MobileNav() {
  const close = (e: React.MouseEvent) => {
    e.currentTarget.closest("details")?.removeAttribute("open")
  }

  return (
    <details className="md:hidden relative">
      <summary
        className="list-none cursor-pointer p-2 rounded-lg hover:bg-slate-light/50 transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5 text-ink" />
      </summary>
      <div className="absolute right-0 top-full mt-2 w-56 bg-paper-raised rounded-xl border border-slate-light shadow-xl p-4 z-50">
        <nav className="flex flex-col gap-3 text-sm text-slate">
          <a href="#features" className="hover:text-ink transition-colors py-1.5" onClick={close}>Features</a>
          <a href="#pricing" className="hover:text-ink transition-colors py-1.5" onClick={close}>Pricing</a>
          <a href="#faq" className="hover:text-ink transition-colors py-1.5" onClick={close}>FAQ</a>
        </nav>
        <div className="border-t border-slate-light mt-3 pt-3 flex flex-col gap-2">
          <Link href="/login" onClick={close}>
            <Button variant="ghost" className="w-full justify-center text-ink">
              Log in
            </Button>
          </Link>
          <Link href="/signup" onClick={close}>
            <Button className="w-full justify-center bg-accent hover:bg-accent/90 text-white">
              Start free trial
            </Button>
          </Link>
        </div>
      </div>
    </details>
  )
}
