"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const STORAGE_KEY = "sanad-last-visited"

function getModuleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  return segments[0] || ""
}

function getLastVisited(mod: string): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const map = JSON.parse(stored) as Record<string, string>
    return map[mod] || null
  } catch {
    return null
  }
}

function saveLastVisited(pathname: string) {
  const mod = getModuleFromPath(pathname)
  if (!mod) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const map = stored ? JSON.parse(stored) : {}
    map[mod] = pathname
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore storage errors
  }
}

function useSmartDefaults() {
  const pathname = usePathname()

  useEffect(() => {
    saveLastVisited(pathname)
  }, [pathname])
}

function getLastVisitedPath(mod: string): string | null {
  return getLastVisited(mod)
}

export { useSmartDefaults, getLastVisitedPath }
