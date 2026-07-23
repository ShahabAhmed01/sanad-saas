"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import { useI18n } from "@/i18n/provider"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-danger" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink mb-2">{t("error.oops")}</h1>
        <h2 className="font-display text-xl font-semibold text-ink mb-2">
          {t("error.somethingWentWrong")}
        </h2>
        <p className="text-slate mb-2">
          {t("error.unexpectedError")}
        </p>
        {error.digest && (
          <p className="text-xs text-slate mb-6 font-mono">
            {t("error.errorId", { id: error.digest })}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("error.tryAgain")}
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("error.dashboard")}
          </Button>
        </div>
      </div>
    </div>
  )
}
