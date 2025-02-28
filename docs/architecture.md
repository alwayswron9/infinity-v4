# Architecture

This document outlines the architectural structure of the Infinity v4 application.

## Directory Structure

The project follows a structured directory layout to organize different components of the application:

```
infinity-v4/
├── .next/                 # Next.js build output
├── docs/                  # Documentation
├── node_modules/          # Node.js dependencies
├── public/                # Static assets
├── src/                   # Source code
│   ├── app/               # Next.js App Router pages
│   │   ├── (protected)/   # Protected routes requiring authentication
│   │   ├── (public)/      # Public routes accessible without authentication
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Landing page
│   ├── components/        # Reusable React components
│   │   ├── data/          # Data-related components
│   │   ├── layout/        # Layout components
│   │   ├── models/        # Model-related components
│   │   ├── navigation/    # Navigation components
│   │   └── ui/            # UI primitive components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configuration
│   │   ├── api/           # API utilities
│   │   ├── auth/          # Authentication utilities
│   │   ├── db/            # Database utilities
│   │   ├── embeddings/    # Embedding functionality
│   │   ├── models/        # Data models
│   │   ├── realtime/      # Real-time functionality with Pusher
│   │   ├── services/      # Service integrations
│   │   ├── stores/        # State management
│   │   └── utils/         # Utility functions
│   ├── middleware.ts      # Next.js middleware for routes
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── .env                   # Environment variables
├── .env.local             # Local environment variables
├── infinity_local_dump.sql # Database schema dump
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── postcss.config.mjs     # PostCSS configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Tech Stack

### Frontend

- **Next.js 15**: React framework for server-rendered applications
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible components
- **Recharts**: Charting library for data visualization
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Zustand**: State management

### Backend (API Routes)

- **Next.js API Routes**: Serverless functions
- **PostgreSQL**: Relational database for data storage
- **MongoDB**: NoSQL database (appears to be used alongside PostgreSQL)
- **JWT**: Authentication token handling
- **bcrypt**: Password hashing

### Real-time Features

- **Pusher**: Real-time messaging
- **Pusher JS**: Client-side integration

### Development Tools

- **ESLint**: Code linting
- **PostCSS**: CSS preprocessing
- **Tailwind**: CSS utility framework

## Application Flow

The application follows a typical Next.js App Router architecture:

1. **Routing**: Based on the file system in the `app` directory
2. **Authentication**: Custom JWT-based authentication system
3. **API Handling**: API routes in the `app/api` directory
4. **State Management**: Combination of React hooks and Zustand
5. **Database**: PostgreSQL for data persistence with custom db utility functions

## Design Patterns

### Component Organization

Components are organized by functionality and reusability:
- UI components for basic UI elements
- Layout components for page structures
- Data components for data display and interaction
- Model components for specific model interactions

### Data Flow

The application appears to follow a unidirectional data flow pattern:
1. State is managed primarily through Zustand stores
2. Components consume state from stores
3. Actions dispatch updates to the stores
4. API calls are made from components or custom hooks
