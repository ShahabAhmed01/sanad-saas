import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const colorClasses = [
  "bg-accent/10 text-accent",
  "bg-success/10 text-success",
  "bg-danger/10 text-danger",
  "bg-blue-500/10 text-blue-500",
  "bg-purple-500/10 text-purple-500",
  "bg-amber-500/10 text-amber-500",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorClasses[Math.abs(hash) % colorClasses.length];
}

export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : "?";
  const colorClass = fallback ? getColorFromName(fallback) : colorClasses[0];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt || fallback || "Avatar"}
        width={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 40 : 32}
        height={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 40 : 32}
        className={cn(
          "rounded-full object-cover ring-1 ring-foreground/10",
          sizeClasses[size],
          className
        )}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium ring-1 ring-foreground/10",
        sizeClasses[size],
        colorClass,
        className
      )}
      aria-label={alt || fallback}
    >
      {initials}
    </div>
  );
}
