"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  label?: string
}

function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  label,
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:opacity-90",
          checked ? "bg-accent" : "bg-slate-light"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[18px]" : "translate-x-[2px]"
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </label>
  )
}

export { Switch }
