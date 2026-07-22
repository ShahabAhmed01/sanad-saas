"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  openItems: Set<string>
  toggle: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: new Set(),
  toggle: () => {},
})

interface AccordionProps {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  defaultValue?: string[]
}

function Accordion({
  children,
  className,
  type = "single",
  defaultValue = [],
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    new Set(defaultValue)
  )

  const toggle = React.useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (type === "single") {
            next.clear()
          }
          next.add(id)
        }
        return next
      })
    },
    [type]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.has(value)
  return (
    <div
      className={cn("rounded-xl border border-border overflow-hidden", className)}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </div>
  )
}

function AccordionTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { openItems, toggle } = React.useContext(AccordionContext)
  const isOpen = openItems.has(value)
  return (
    <button
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full items-center justify-between p-5 text-left font-semibold text-foreground transition-colors hover:bg-muted/50 hover:text-accent",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

function AccordionContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.has(value)
  if (!isOpen) return null
  return (
    <div
      className={cn("px-5 pb-5 text-sm text-muted-foreground leading-relaxed", className)}
    >
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
