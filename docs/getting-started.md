# Getting Started

This guide will help you set up the Infinity v4 project locally for development.

## License Notice

Before proceeding, please note that Infinity v4 is licensed under a custom OSS-like license that permits personal use, business use, and agency use while restricting white-labeling and reselling of the software. By using this software, you agree to comply with the license terms. See the [License documentation](./license.md) for more details.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (latest LTS version recommended)
- npm, yarn, pnpm, or bun (package managers)
- PostgreSQL (for the database)

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd infinity-v4
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Environment Setup**

Copy the `.env.local` example file and configure the environment variables:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file to include your database connection string, API keys, and other required environment variables.

4. **Database Setup**

The project includes a SQL dump file (`infinity_local_dump.sql`) that can be used to set up the initial database schema:

```bash
psql -U your_username -d your_database_name -f infinity_local_dump.sql
```

## Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run the linter to check for code issues

## Development Workflow

1. Make changes to the codebase
2. The development server will auto-refresh to show your changes
3. Check the console for any errors
4. If needed, restart the development server

## Troubleshooting

If you encounter any issues during setup or development:

1. Ensure all dependencies are installed correctly
2. Verify that your environment variables are set up properly
3. Check that PostgreSQL is running and accessible
4. Consult the error messages in the console for specific issues
