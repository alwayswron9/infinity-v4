import React from 'react';
import { cn } from '@/lib/utils';

interface EditableHeadingProps { 
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  className?: string;
}

export function EditableHeading({ 
  value, 
  onChange, 
  isEditing, 
  onEditStart, 
  onEditEnd,
  className 
}: EditableHeadingProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      onEditEnd();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onEditEnd();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent border-none outline-none focus:ring-0",
          "text-base font-medium",
          className
        )}
      />
    );
  }

  return (
    <h2 
      onClick={onEditStart}
      className={cn(
        "text-base font-medium cursor-pointer hover:opacity-80",
        className
      )}
    >
      {value}
    </h2>
  );
} 