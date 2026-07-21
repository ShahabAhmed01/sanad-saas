import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
    >
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          {title}
        </h1>
        {description && <p className="text-slate mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
