import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl';
  className?: string;
}

export function PageContainer({ children, maxWidth = '7xl', className }: PageContainerProps) {
  return (
    <div className={cn(`px-4 py-4 max-w-${maxWidth} mx-auto space-y-6`, className)}>
      {children}
    </div>
  );
} 