import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-1",
          "focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-surface-hover"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-text-secondary rounded-md w-9 font-normal text-[0.8rem]",
          "text-center"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm relative p-0 rounded-md",
          "focus-within:relative focus-within:z-20",
          "hover:bg-surface-hover transition-colors"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal",
          "inline-flex items-center justify-center rounded-md text-sm",
          "aria-selected:opacity-100 aria-selected:bg-primary aria-selected:text-primary-foreground",
          "hover:bg-surface-hover hover:text-text-primary",
          "focus:bg-surface-hover focus:text-text-primary focus:outline-none"
        ),
        day_today: "bg-surface text-text-primary",
        day_outside: "text-text-secondary opacity-50",
        day_disabled: "text-text-disabled",
        day_range_middle: "aria-selected:bg-surface aria-selected:text-text-primary",
        day_selected: "bg-primary text-primary-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
} 