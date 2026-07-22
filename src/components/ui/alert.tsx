import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface AlertProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  default: {
    container: "bg-muted border-border",
    icon: null,
    iconColor: "text-muted-foreground",
  },
  success: {
    container: "bg-success/10 border-success/20",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  warning: {
    container: "bg-accent/10 border-accent/20",
    icon: AlertTriangle,
    iconColor: "text-accent",
  },
  error: {
    container: "bg-danger/10 border-danger/20",
    icon: XCircle,
    iconColor: "text-danger",
  },
  info: {
    container: "bg-blue-500/10 border-blue-500/20",
    icon: Info,
    iconColor: "text-blue-500",
  },
};

export function Alert({ variant = "default", title, children, className }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border text-sm",
        config.container,
        className
      )}
    >
      {Icon && (
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-medium mb-1", config.iconColor)}>{title}</p>
        )}
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}
