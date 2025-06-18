# CDCR Development Portal

A comprehensive developer portal built with Backstage for the California Department of Corrections and Rehabilitation (CDCR).

## Overview

The CDCR Development Portal provides:
- **Service Catalog** - Centralized view of all 20+ CDCR applications
- **Kubernetes Monitoring** - Real-time status across 6 clusters (dev, test, stage, prod, sandbox, ss-prod)
- **GitHub Actions CI/CD** - Build and deployment status
- **Flux GitOps** - GitOps deployment tracking
- **TechDocs** - Automated documentation from repositories
- **Service Templates** - Standardized project creation

## Quick Start

### For Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Access at: http://localhost:3000

### For Production Deployment

See [Deployment Guide](docs/deployment-guide.md) for complete instructions.

## Deployment

### Building the Docker Image

```bash
# Build production image
docker build -t cdcr/backstage:latest .

# Tag and push to your registry
docker tag cdcr/backstage:latest your-registry.com/cdcr/backstage:latest
docker push your-registry.com/cdcr/backstage:latest
```

### Kubernetes Deployment

```bash
# Deploy to cluster
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/backstage-secrets.yaml  # Update secrets first!
kubectl apply -f kubernetes/backstage-deployment.yaml
```

## Repository Structure

```
├── packages/           # Frontend and backend code
├── catalog/           # Service catalog definitions
├── templates/         # Service creation templates
├── kubernetes/        # Kubernetes deployment manifests
├── docs/             # Documentation
└── app-config.yaml   # Main configuration
```

## Configuration

Required environment variables for production:

```bash
# GitHub Integration
GITHUB_TOKEN=your-token
AUTH_GITHUB_CLIENT_ID=your-client-id
AUTH_GITHUB_CLIENT_SECRET=your-client-secret

# Database
POSTGRES_HOST=postgres
POSTGRES_USER=backstage
POSTGRES_PASSWORD=your-password

# Kubernetes Clusters (6 clusters total)
KUBERNETES_DEV_URL=https://your-cluster
KUBERNETES_DEV_SA_TOKEN=your-token
# ... repeat for test, stage, prod, sandbox, ss-prod
```

## Support

- **Documentation**: See [docs/](docs/) directory
- **Deployment Guide**: [docs/deployment-guide.md](docs/deployment-guide.md)
- **Kubernetes Setup**: [docs/kubernetes-setup.md](docs/kubernetes-setup.md)