# Stage 1: Build the frontend
FROM node:18-bullseye-slim AS packages

WORKDIR /app
COPY package.json yarn.lock ./
COPY packages packages

# Install dependencies
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    yarn install --frozen-lockfile --network-timeout 300000

# Stage 2: Build the backend
FROM node:18-bullseye-slim AS build

# Install isolate-vm dependencies
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 g++ build-essential && \
    yarn config set python /usr/bin/python3

# Install sqlite3 dependencies
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get install -y --no-install-recommends libsqlite3-dev

WORKDIR /app

# Copy source code
COPY --from=packages --chown=node:node /app .

# Copy catalog and templates
COPY catalog catalog
COPY templates templates
COPY app-config.yaml app-config.production.yaml ./

USER node

# Build the backend
RUN yarn build:backend --config app-config.yaml --config app-config.production.yaml

# Stage 3: Build the final runtime image
FROM node:18-bullseye-slim

# Install tools needed for runtime
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 g++ build-essential libsqlite3-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Install Docker for TechDocs
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    apt-transport-https ca-certificates curl gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-ce-cli

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=build --chown=node:node /app/packages/backend/dist/bundle.tar.gz .
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

# Copy catalog and templates for runtime
COPY --chown=node:node catalog catalog
COPY --chown=node:node templates templates

USER node

# Expose port
EXPOSE 7007

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7007/healthcheck || exit 1

# Start the application
CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]