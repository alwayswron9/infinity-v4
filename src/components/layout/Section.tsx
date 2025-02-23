import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function Section({ children, title, description, actions, className }: SectionProps) {
  return (
    <div className={cn("bg-surface/50 rounded-xl p-4 mb-6", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="space-y-1">
            {title && <h2 className="text-xl font-semibold text-text-primary">{title}</h2>}
            {description && <p className="text-sm text-text-secondary">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      <div className="space-y-4 px-4">
        {children}
      </div>
    </div>
  );
} 