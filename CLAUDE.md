# Infinity v4 Development Guide

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Code Style
- **Imports**: Group by: 1) External libraries 2) Local components 3) Styles
- **TypeScript**: Always use proper types, avoid `any` when possible, use interface for object structures
- **Naming**: PascalCase for components, camelCase for functions/variables, ALL_CAPS for constants
- **Components**: Use function components with explicit typing for props interfaces
- **Error Handling**: Use try/catch with toast feedback for user-facing errors
- **Formatting**: Use destructuring for props, template literals for string concatenation
- **State Management**: Prefer React hooks for local state, Zustand for global state
- **UI Framework**: Primary UI through Chakra UI and Radix UI components
- **File Structure**: Keep related components in same directory, group by feature
- **CSS**: Use Tailwind CSS for styling with Chakra UI theme integration

## Architecture
- **Framework**: Next.js 15 with App Router architecture
- **Protected Routes**: Use (protected) directory for authenticated routes
- **API Routes**: RESTful endpoints in src/app/api with consistent response formats
- **Database**: PostgreSQL with pgvector extension for vector embeddings
- **Authentication**: JWT token-based auth with cookie storage and API key support
- **Middleware**: Route protection via withAuth and withApiKey middleware
- **Services**: Domain logic in service classes (ModelService, DataService, etc.)

## Common Patterns
- **Database**: Use parameterized queries with executeQuery helper
- **Auth**: Verify tokens with verifyToken from lib/auth/jwt
- **Error Responses**: Use createErrorResponse for consistent error formatting
- **Data Models**: Define types in src/types with proper interfaces
- **API Handlers**: Return NextResponse.json with appropriate status codes
- **Embedding**: Vector search available via vectorSimilaritySearch helper