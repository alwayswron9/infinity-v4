import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'badge-base',
  {
    variants: {
      variant: {
        default: 'badge-primary',
        secondary: 'badge-secondary',
        outline: 'badge-outline',
        destructive: 'border-transparent bg-status-error text-white',
        success: 'border-transparent bg-status-success text-white',
        warning: 'border-transparent bg-status-warning text-white',
        info: 'border-transparent bg-status-info text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 