import React from 'react';
import { cn } from '@/lib/utils';

// Basic table components
export const Table: React.FC<React.HTMLProps<HTMLTableElement>> = ({ children, ...props }) => (
  <table {...props} className="w-full">{children}</table>
);

export const TableHeader: React.FC<React.HTMLProps<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <thead {...props}>{children}</thead>
);

export const TableBody: React.FC<React.HTMLProps<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <tbody {...props}>{children}</tbody>
);

export const TableRow: React.FC<React.HTMLProps<HTMLTableRowElement>> = ({ children, ...props }) => (
  <tr {...props} className="border-b hover:bg-gray-50">{children}</tr>
);

export const TableHead: React.FC<React.HTMLProps<HTMLTableCellElement>> = ({ children, ...props }) => (
  <th {...props} className="px-3 py-2 text-left font-medium text-sm text-gray-600 border-b bg-gray-50">{children}</th>
);

export const TableCell: React.FC<React.HTMLProps<HTMLTableCellElement>> = ({ children, ...props }) => (
  <td {...props} className="px-3 py-2 text-sm border-b">{children}</td>
);

// Basic card component
export const Card: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className="rounded-lg border p-4 bg-white">{children}</div>
);

// Basic skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

// Basic alert components
export const Alert: React.FC<{ variant?: 'default' | 'destructive'; children: React.ReactNode }> = ({ variant = 'default', children }) => (
  <div className={cn(
    "p-4 rounded-lg",
    variant === 'destructive' ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-900'
  )}>
    {children}
  </div>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm">{children}</div>
);

// Input component for filters
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-8 w-full rounded-md border px-3 py-1 text-sm shadow-sm",
        "focus:outline-none focus:ring-1 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input'; 