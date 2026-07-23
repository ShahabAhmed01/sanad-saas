"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="border-danger max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-display text-xl font-semibold text-ink">
            {t("error.somethingWentWrong")}
          </h2>
          <p className="text-sm text-slate">{error.message}</p>
          {error.digest && (
            <p className="text-xs text-slate font-mono">
              {t("error.errorId", { id: error.digest })}
            </p>
          )}
          <Button
            onClick={reset}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {t("error.tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
