"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

const sideClasses = {
  left: "inset-y-0 left-0 h-full w-72 border-r",
  right: "inset-y-0 right-0 h-full w-72 border-l",
  top: "inset-x-0 top-0 border-b",
  bottom: "inset-x-0 bottom-0 border-t",
};

const slideClasses = {
  left: "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  right: "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  top: "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  bottom: "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
};

function Sheet({ open, onOpenChange, children, side = "right" }: SheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div
        data-state={open ? "open" : "closed"}
        className={cn(
          "fixed z-50 bg-popover p-4 shadow-xl animate-in duration-200",
          sideClasses[side],
          slideClasses[side]
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SheetContent({ children, className }: SheetContentProps) {
  return <div className={cn("h-full", className)}>{children}</div>;
}

function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h2>
  );
}

function SheetClose({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 hover:bg-muted transition-colors",
        className
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose };
