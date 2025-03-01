# Components

This document provides an overview of the key components in the Infinity v4 application.

## Component Organization

The components in the application are organized into several directories based on their functionality:

### UI Components (`/src/components/ui`)

These are primitive UI components based on Radix UI primitives and custom implementations. They serve as the building blocks for more complex components.

Examples include:
- Buttons
- Inputs
- Modals
- Tooltips
- Dropdowns
- Switches

### Layout Components (`/src/components/layout`)

These components are responsible for the overall layout structure of the application.

Examples include:
- Page layouts
- Sidebars
- Headers
- Footers

### Data Components (`/src/components/data`)

These components are focused on data display, visualization, and manipulation.

Examples include:
- Tables
- Charts
- Data grids
- Forms for data entry
- Data cards

### Models Components (`/src/components/models`)

These components are specific to model operations and displays.

Examples include:
- Model viewers
- Model editors
- Model statistics

### Navigation Components (`/src/components/navigation`)

These components handle navigation within the application.

Examples include:
- Navigation bars
- Breadcrumbs
- Menu systems

## Component Design Principles

The component architecture follows these principles:

1. **Composition**: Components are designed to be composable, allowing for flexible combinations
2. **Single Responsibility**: Each component has a focused purpose
3. **Reusability**: Components are built to be reusable across different parts of the application
4. **Accessibility**: Using Radix UI primitives ensures accessibility is built-in
5. **Type Safety**: Components are typed with TypeScript for better developer experience

## Usage Examples

### Basic UI Component Example

```tsx
import { Button } from '@/components/ui/button';

function MyComponent() {
  return (
    <Button variant="primary" onClick={handleClick}>
      Click Me
    </Button>
  );
}
```

### Data Component Example

```tsx
import { DataTable } from '@/components/data/data-table';
import { columns } from './columns';

function UsersTable({ data }) {
  return <DataTable columns={columns} data={data} />;
}
```

## State Management in Components

Components in this application can manage state in several ways:

1. **Local State**: Using React's `useState` and `useReducer` hooks
2. **Global State**: Using Zustand stores
3. **Form State**: Using React Hook Form
4. **Server State**: Using custom hooks for data fetching

## Component Styling

The application uses a combination of:

1. **Tailwind CSS**: For utility-based styling
2. **CSS Modules**: For component-specific styles
3. **Class Variance Authority (CVA)**: For variant-based styling
4. **tailwind-merge**: For conditional class merging

## Custom Hooks for Components

The application includes custom hooks in the `/src/hooks` directory that can be used with components to provide additional functionality.
