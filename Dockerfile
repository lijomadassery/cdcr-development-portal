FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 g++ build-essential libsqlite3-dev curl git && \
    rm -rf /var/lib/apt/lists/*

# Enable Corepack and set up Yarn 4.4.1
RUN corepack enable && \
    corepack prepare yarn@4.4.1 --activate

# Set working directory
WORKDIR /app

# Copy Yarn configuration and package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY packages/app/package.json ./packages/app/
COPY packages/backend/package.json ./packages/backend/
COPY plugins/kubernetes-logs/package.json ./plugins/kubernetes-logs/

# Copy source code (includes plugins)
COPY . .

# Install dependencies
RUN yarn install --network-timeout 600000

# Clean and reinstall to resolve any patch issues
RUN yarn cache clean && yarn install --network-timeout 600000

# Build both frontend and backend
WORKDIR /app
RUN yarn build:all

# Extract the built backend bundle
WORKDIR /app/packages/backend
RUN tar -xzf dist/bundle.tar.gz -C /app --strip-components=0
WORKDIR /app

# Expose port
EXPOSE 7007

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7007/healthcheck || exit 1

# Start the application
CMD ["node", "packages/backend/dist/index.cjs.js", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]