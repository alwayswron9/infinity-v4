# Infinity v4

<p align="center">
  <img src="public/logo.png" alt="Infinity v4 Logo" width="200" />
</p>

<p align="center">
  <strong>A powerful, modern SaaS platform built with Next.js, PostgreSQL, and SaaS UI</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api">API</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#versioning">Versioning</a> •
  <a href="#license">License</a>
</p>

## Features

Infinity v4 is a comprehensive SaaS platform that includes:

- **Authentication System**: Secure user authentication with JWT tokens
- **API Key Management**: Generate and manage API keys for external integrations
- **Protected Routes**: Role-based access control for secure application areas
- **Database Integration**: PostgreSQL database with connection pooling
- **Real-time Updates**: Pusher integration for real-time features
- **Model Management**: Create and manage AI models
- **Dashboard**: Interactive analytics dashboard
- **Settings Management**: User and application settings
- **Versioning System**: Track changes between releases with a simple markdown-based system
- **Modern UI**: Built with SaaS UI components and Tailwind CSS
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **SaaS UI**: Component library for SaaS applications
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Zustand**: State management
- **React Hook Form**: Form validation
- **Zod**: Schema validation
- **Recharts**: Charting library
- **Tanstack Table**: Data table management

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **PostgreSQL**: Relational database
- **JSON Web Tokens**: Authentication
- **OpenAI**: Vector embeddings for AI features
- **Pusher**: Real-time updates

### DevOps
- **Docker**: Containerization
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Vercel**: Deployment platform (recommended)

## Getting Started

### Prerequisites

- Node.js 18 or later
- PostgreSQL database
- OpenAI API key (for vector embeddings)
- Pusher account (for real-time features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/infinity-v4.git
   cd infinity-v4
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # PostgreSQL
   POSTGRES_URL=postgresql://username:password@localhost:5432/database
   POSTGRES_USER=username
   POSTGRES_PASSWORD=password
   POSTGRES_DB=database

   # Authentication
   JWT_SECRET=your-jwt-secret
   API_KEY_PREFIX=inf_
   API_KEY_HEADER=X-API-Key
   API_KEY_COLLECTION=api_keys

   # OpenAI (for vector embeddings)
   OPENAI_API_KEY=your-openai-api-key

   # App
   NODE_ENV=development

   # Public API config
   PUBLIC_API_RATE_LIMIT=100
   PUBLIC_API_CACHE_TTL=3600
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

Infinity v4 follows a modern architecture pattern:

- **App Router**: Next.js App Router for file-based routing
- **Server Components**: React Server Components for improved performance
- **API Routes**: Serverless API endpoints
- **Database Layer**: PostgreSQL with connection pooling
- **Authentication**: JWT-based authentication system
- **Protected Routes**: Middleware for securing routes
- **Component Structure**: Organized component hierarchy

### Directory Structure

```
infinity-v4/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── (protected)/      # Protected routes
│   │   └── ...
│   ├── components/           # React components
│   │   ├── ui/               # UI components
│   │   ├── layout/           # Layout components
│   │   ├── navigation/       # Navigation components
│   │   └── ...
│   ├── lib/                  # Utility libraries
│   │   ├── db/               # Database utilities
│   │   ├── auth/             # Authentication utilities
│   │   ├── api/              # API utilities
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles
├── public/                   # Static assets
├── docs/                     # Documentation
├── versions/                 # Version files
└── ...
```

## API

Infinity v4 provides a comprehensive API for integrating with external services:

- **Authentication**: JWT-based authentication
- **API Keys**: API key management for secure access
- **Rate Limiting**: Configurable rate limiting
- **Caching**: Response caching for improved performance
- **Versioning**: API versioning for backward compatibility

API documentation is available in the `/docs/api` directory.

## Deployment

### Docker

Infinity v4 includes a Dockerfile for containerized deployment:

1. Build the Docker image:
   ```bash
   docker build -t infinity-v4 .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env.production infinity-v4
   ```

### Vercel

The easiest way to deploy Infinity v4 is using Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## Versioning

Infinity v4 uses a simple markdown-based versioning system to track changes between releases:

- Version files are stored in the `versions/` directory
- Each version is defined in a Markdown file with a specific format
- The system automatically determines the latest version and displays version history
- Version information is accessible through a dedicated API endpoint at `/api/versions`
- Versions are displayed in the Settings page under the "About" tab

Current version: v0.2.0

For more details, see the [Versioning documentation](/VERSIONING.md).

## License

Infinity v4 is licensed under a custom OSS-like license that permits personal use, business use, and agency use while restricting white-labeling and reselling of the software. For complete details, see the [LICENSE.md](/LICENSE.md) file and the [License documentation](/docs/license.md).

## Documentation

Comprehensive documentation is available in the [docs](/docs) directory, covering:
- [Project Overview](/docs/project-overview.md)
- [Getting Started](/docs/getting-started.md)
- [Architecture](/docs/architecture.md)
- [Components](/docs/components.md)
- [API Reference](/docs/api-reference.md)
- [Database](/docs/database.md)
- [Authentication](/docs/authentication.md)
- [Deployment](/docs/deployment.md)
- [License](/docs/license.md)
- [Versioning](/VERSIONING.md)

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [React Documentation](https://react.dev/) - learn about React
- [SaaS UI Documentation](https://saas-ui.dev/docs) - learn about SaaS UI components
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - learn about PostgreSQL
- [Vercel Documentation](https://vercel.com/docs) - learn about Vercel deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you need help with Infinity v4, please open an issue on GitHub or contact the maintainers.
