# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy remaining source code
COPY . .

# Compile TypeScript to JavaScript (typically outputs to ./dist)
RUN npm run build

# Prune devDependencies to keep production image light
RUN npm prune --production

# ==========================================
# STAGE 2: Production Stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root system user for security
RUN addgroup -g 1001 -S nodejs && \
      adduser -S expressjs -u 1001

# Copy compiled JavaScript and pruned node_modules from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# COPY MIGRATIONS AND CONFIG FOR DRIZZLE-KIT CLI
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Switch to non-root user
USER expressjs

# Start compiled Express server
CMD ["node", "dist/main.js"]
