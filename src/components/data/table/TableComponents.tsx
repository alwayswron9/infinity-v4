import React from 'react';
import { cn } from '@/lib/utils';

// Core table wrapper component - responsible for the overall table layout
export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("table-root w-full h-full flex flex-col", className)}>
      {props.children}
    </div>
  );
}

// Table content wrapper - responsible for scrolling behavior
export function TableContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("table-container flex-1 overflow-auto", className)}>
      <table className="w-full table-fixed border-collapse">
        {props.children}
      </table>
    </div>
  );
}

// Table header components
export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("table-header sticky top-0 z-10", className)}>
      {props.children}
    </thead>
  );
}

// Table body component
export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("table-body", className)}>
      {props.children}
    </tbody>
  );
}

// Table row component
export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("table-row hover:bg-surface-2 transition-colors", className)}>
      {props.children}
    </tr>
  );
}

// Table header cell component
export function TableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("table-header-cell bg-surface-1 text-text-primary font-medium py-3 px-4 text-left", className)}
      {...props}
    >
      {props.children}
    </th>
  );
}

// Table data cell component
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  colSpan?: number;
}

export function TableCell({
  className,
  colSpan,
  ...props
}: TableCellProps) {
  return (
    <td 
      className={cn("table-cell py-3 px-4 text-sm text-text-secondary", className)} 
      colSpan={colSpan}
      {...props}
    >
      <div className="cell-content truncate">
        {props.children}
      </div>
    </td>
  );
}

// Skeleton component for loading states
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-2",
        className
      )}
      {...props}
    />
  );
}

// Basic card component
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface-1 rounded-md shadow-sm w-full h-full flex flex-col",
        className
      )}
      {...props}
    />
  );
}

// Alert component
export function Alert({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive'
}) {
  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-md",
        variant === 'destructive' && "bg-status-error bg-opacity-10 text-status-error",
        className
      )}
      {...props}
    />
  );
}

// Alert description
export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

// Input component for filters
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md bg-surface-1 px-3 py-1 text-sm",
        "focus:outline-none focus:ring-1 focus:ring-brand-primary",
        "placeholder:text-text-tertiary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input'; 