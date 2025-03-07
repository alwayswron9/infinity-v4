FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm i; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG POSTGRES_URL
ARG JWT_SECRET
ARG API_KEY_PREFIX
ARG API_KEY_HEADER
ARG API_KEY_COLLECTION
ARG OPENAI_API_KEY
ARG NODE_ENV
ARG PUBLIC_API_RATE_LIMIT
ARG PUBLIC_API_CACHE_TTL

# NextJS collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line if you want to disable telemetry
# RUN npx next telemetry disable

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for the app directory
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose the port NextJS runs on
EXPOSE 3000

# Set environment variables for runtime
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the NextJS application
CMD ["npm", "start"] 