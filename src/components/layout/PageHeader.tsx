import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6 px-4">
      {backHref && (
        <Link
          href={backHref}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
      )}
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {description && (
          <p className="text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
} 