"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InlineEditProps {
  value: string | number
  onSave: (value: string | number) => void | Promise<void>
  type?: "text" | "number"
  className?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

function InlineEdit({
  value,
  onSave,
  type = "text",
  className,
  placeholder,
  min,
  max,
  step,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(String(value))
  const [saving, setSaving] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  async function handleSave() {
    setSaving(true)
    try {
      const parsed = type === "number" ? Number(draft) : draft
      if (type === "number" && isNaN(parsed as number)) return
      await onSave(parsed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraft(String(value))
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") handleCancel()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          className={cn(
            "h-8 w-20 rounded-md border border-accent bg-background px-2 text-sm text-foreground outline-none ring-1 ring-accent/50",
            className
          )}
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10"
          onClick={handleSave}
          disabled={saving}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-danger hover:text-danger hover:bg-danger/10"
          onClick={handleCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm hover:bg-muted/50 transition-colors cursor-text",
        className
      )}
    >
      <span>{value || placeholder || "—"}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </button>
  )
}

export { InlineEdit }
