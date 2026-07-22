"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HoverPreviewProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
}

function HoverPreview({
  children,
  content,
  className,
  side = "top",
  align = "start",
}: HoverPreviewProps) {
  const [visible, setVisible] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 150)
  }

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "origin-bottom-left" : "origin-top-left",
    center: "",
    end: side === "top" || side === "bottom" ? "origin-bottom-right" : "origin-bottom-right",
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none",
            positionClasses[side],
            alignClasses[align]
          )}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div
            className={cn(
              "rounded-xl border border-border bg-paper-raised shadow-lg p-4 min-w-[240px] max-w-[320px]",
              "animate-in fade-in-0 zoom-in-95 duration-150",
              className
            )}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

export { HoverPreview }
