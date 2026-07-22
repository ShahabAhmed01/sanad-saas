import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="relative mb-6">
        {/* Decorative rings */}
        <div className="absolute inset-0 -m-3 rounded-full bg-muted/50 animate-pulse" />
        <div className="absolute inset-0 -m-6 rounded-full bg-muted/30" />
        {/* Icon */}
        <div className="relative rounded-full bg-muted p-5 shadow-sm">
          <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {action && (
          <Button onClick={action.onClick} className="bg-accent hover:bg-accent/90 text-white">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant="outline">
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
