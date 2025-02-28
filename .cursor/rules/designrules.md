# Infinity Design System 2024

A clean, professional SaaS design system focused on clarity, usability, and performance. Minimalist aesthetic with purposeful design elements.

## Design Principles

1. **Clarity First** - Information presented clearly and directly
2. **Consistent Interface** - Predictable component patterns across the application
3. **Performance Focused** - No unnecessary animations, efficient rendering
4. **Effective Hierarchy** - Visual contrast guides user attention to important elements
5. **Purposeful Design** - Every element serves a specific function

## Color System

### Primary Palette

```css
/* Core Brand Colors */
--brand-primary: #7056F8;      /* Main brand color - vibrant purple */
--brand-secondary: #8F7DFC;    /* Supporting brand color - lighter purple */
--brand-tertiary: #5D46D6;     /* Accent brand color - darker purple */

/* Surface Colors - Using overlays for depth */
--surface-0: #0D1117;          /* Base background - dark charcoal */
--surface-1: #161B22;          /* First level - components */
--surface-2: #21262D;          /* Second level - elevated components */
--surface-3: #30363D;          /* Third level - highest elevation */

/* Border Colors */
--border-primary: rgba(255, 255, 255, 0.1);
--border-focus: var(--brand-primary);

/* Interaction States */
--state-hover: rgba(112, 86, 248, 0.1);
--state-focus: rgba(112, 86, 248, 0.2);
--state-active: rgba(112, 86, 248, 0.3);
--state-selected: rgba(112, 86, 248, 0.15);

/* Status Colors with Semantic Meaning */
--status-success: #4CAF50;
--status-success-subtle: rgba(76, 175, 80, 0.1);
--status-warning: #F59E0B;
--status-warning-subtle: rgba(245, 158, 11, 0.1);
--status-error: #F87171;
--status-error-subtle: rgba(248, 113, 113, 0.1);
--status-info: #3B82F6;
--status-info-subtle: rgba(59, 130, 246, 0.1);

/* Text Colors with Improved Contrast */
--text-primary: #F8FAFC;       /* High contrast for important text */
--text-secondary: #CBD5E1;     /* Secondary information */
--text-tertiary: #94A3B8;      /* Supporting text */
--text-disabled: #475569;      /* Disabled state text */
```

### Color Usage Guidelines

1. **Surface System**
   - Use surface levels for subtle visual hierarchy
   - `surface-0`: Main application background
   - `surface-1`: Card and component backgrounds
   - `surface-2`: Elevated components, secondary areas
   - `surface-3`: Highest elevation, interactive elements

2. **Interactive Elements**
   - Primary actions: `brand-primary` (#7056F8)
   - Secondary actions: `surface-2` with borders
   - Tertiary actions: Text-only with hover states
   - Destructive actions: `status-error` (#F87171)

3. **Status Communication**
   - Success: Green (`status-success`)
   - Warning: Amber (`status-warning`) 
   - Error: Red (`status-error`)
   - Info: Blue (`status-info`)

## Typography System

### Font Stack
```css
--font-display: 'Inter', system-ui, sans-serif;  /* Headlines, titles */
--font-body: 'Inter', system-ui, sans-serif;     /* Body text */
--font-mono: 'JetBrains Mono', monospace;        /* Code, technical content */
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px - Small text, badges */
--text-sm: 0.875rem;   /* 14px - UI text, buttons */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Section headers */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Large headers */
```

### Typography Guidelines

1. **Text Hierarchy**
   - Page titles: `text-2xl`, `font-semibold`, `text-text-primary`
   - Section headers: `text-xl`, `font-medium`
   - Card titles: `text-base`, `font-medium`
   - Body text: `text-sm`, `text-text-primary`
   - Supporting text: `text-xs`, `text-text-secondary`

2. **Font Weight Usage**
   - `font-medium` (500): Titles, buttons, emphasized text
   - `font-semibold` (600): Page titles, important elements
   - `font-normal` (400): Body text, regular content

## Shadow System

```css
/* Subtle shadows for depth without floating effects */
.shadow-subtle {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

/* No shadow option */
.shadow-none {
  box-shadow: none;
}
```

## Component System

### Button System

The button system uses variants to handle different emphasis levels:

```jsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="tertiary">Text Action</Button>
<Button variant="destructive">Delete</Button>
```

#### Implementation

```css
/* Base Button */
.btn-base {
  @apply relative inline-flex items-center justify-center rounded-md text-sm font-medium 
         transition-colors focus-visible:outline-none focus-visible:ring-1 
         focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50;
}

/* Primary Button */
.btn-primary {
  @apply btn-base bg-brand-primary text-white hover:bg-brand-tertiary;
}

/* Secondary Button */
.btn-secondary {
  @apply btn-base bg-surface-2 text-text-primary hover:bg-surface-3;
}

/* Tertiary Button */
.btn-tertiary {
  @apply btn-base bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-1 border-0 shadow-none;
}
```

### Card System

Cards are used for grouping related content:

```jsx
<div className="model-card-modern">
  <div className="model-card-header">
    <h3 className="model-name">Card Title</h3>
  </div>
  <div className="model-description">
    Description text here
  </div>
  {/* Card content */}
</div>
```

#### Implementation

```css
/* Modern Card */
.model-card-modern {
  @apply p-4 flex flex-col rounded-md border overflow-hidden;
  background-color: var(--surface-1);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  height: 100%;
}

/* Card Header */
.model-card-header {
  @apply flex items-start justify-between mb-3;
}

/* Card Title */
.model-name {
  @apply text-base font-medium truncate;
  color: var(--text-primary);
}

/* Card Description */
.model-description {
  @apply text-xs mt-1 truncate;
  color: var(--text-secondary);
  width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
}
```

### Badge System

Badges are used to display small pieces of information:

```jsx
<span className="badge-primary">New</span>
<span className="badge-secondary">Draft</span>
<span className="badge-outline">Tag</span>
```

#### Implementation

```css
/* Base Badge */
.badge-base {
  @apply inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold 
         transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary 
         focus:ring-offset-2;
}

/* Primary Badge */
.badge-primary {
  @apply badge-base border-transparent bg-brand-primary text-white;
}

/* Secondary Badge */
.badge-secondary {
  @apply badge-base border-transparent bg-surface-2 text-text-primary;
}

/* Outline Badge */
.badge-outline {
  @apply badge-base border-surface-2 text-text-primary;
}
```

### Form Elements

#### Input Field

```jsx
<input className="input" type="text" placeholder="Enter text..." />
```

```css
.input {
  @apply flex h-9 w-full rounded-md border border-surface-2 bg-surface-1 px-3 py-1
         text-sm shadow-subtle transition-colors file:border-0 file:bg-transparent
         file:text-sm file:font-medium placeholder:text-text-tertiary
         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary
         disabled:cursor-not-allowed disabled:opacity-50;
}
```

#### Search Input

```jsx
<input className="search-input" type="search" placeholder="Search..." />
```

```css
.search-input {
  @apply bg-surface-1 border border-surface-2 rounded-md py-2 pl-9 pr-3 text-sm 
         text-text-primary placeholder:text-text-tertiary focus-visible:outline-none 
         focus-visible:ring-0 focus:border-surface-3 w-full;
}
```

## Layout System

### Grid System

```css
/* Responsive Model Grid */
.model-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

### Page Layout

```css
/* Page Container */
.page-container {
  @apply px-6 py-8 max-w-7xl mx-auto space-y-8;
}

/* Page Header */
.page-header {
  @apply flex flex-col gap-3 md:flex-row md:items-center md:justify-between;
}

/* Page Title */
.page-title {
  @apply text-2xl font-semibold text-text-primary tracking-tight;
}
```

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Border Radius

```css
border-radius: {
  lg: "0.5rem",       /* 8px */
  md: "0.375rem",     /* 6px */
  sm: "0.25rem",      /* 4px */
  full: "9999px",     /* Circle */
}
```

## Best Practices

### Design Guidelines

1. **Minimal Design**
   - Remove unnecessary decorative elements
   - Avoid complex animations and effects
   - Use subtle transitions for necessary state changes

2. **Visual Hierarchy**
   - Primary actions should stand out (brand color)
   - Secondary actions should be visually subdued
   - Use spacing and typography to create structure

3. **Color Usage**
   - Brand colors for primary actions and key elements
   - Neutral surfaces for content areas
   - Status colors only for relevant information
   - Maintain contrast for accessibility

4. **Component Consistency**
   - Maintain consistent padding and spacing
   - Buttons should look and behave consistently
   - Cards should follow the same structure

### Implementation Guidelines

1. **CSS Organization**
   - Global styles in `globals.css`
   - Feature-specific styles in dedicated files (e.g., `models.css`)
   - Use Tailwind's `@layer` directive for organization
   - Prefer Tailwind utility classes when possible

2. **Responsive Design**
   - Use responsive utilities (`md:`, `lg:` prefixes)
   - Test on multiple device sizes
   - Follow mobile-first approach

3. **Accessibility**
   - Ensure sufficient color contrast
   - Provide proper focus states
   - Use semantic HTML elements
   - Add appropriate ARIA attributes 