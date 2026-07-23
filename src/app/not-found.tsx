"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, ArrowLeft } from "lucide-react"
import { useI18n } from "@/i18n/provider"

export default function NotFound() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="h-10 w-10 text-accent" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold text-ink mb-2">
          {t("error.notFoundTitle")}
        </h2>
        <p className="text-slate mb-8">
          {t("error.notFoundDesc")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("error.backToDashboard")}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">{t("error.goHome")}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
