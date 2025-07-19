# CDCR Development Portal Documentation

## Quick Start for Production Deployment

**For immediate ss-prod deployment**, follow these guides in order:

1. **[SS-PROD Deployment Guide](./ss-prod-deployment.md)** - Quick checklist for ss-prod cluster deployment
2. **[Production Deployment Guide](./production-deployment-guide.md)** - Comprehensive deployment instructions
3. **[Production Troubleshooting](./troubleshooting/production-issues.md)** - Common issues and solutions

## Available Documentation

### Deployment Guides
- **[Production Deployment Guide](./production-deployment-guide.md)** - Complete production deployment instructions
- **[SS-PROD Specific Configuration](./ss-prod-deployment.md)** - ss-prod cluster specific steps

### Plugin Configuration
- **[Kubernetes Plugin Setup](./kubernetes-plugin-setup-guide.md)** - Kubernetes integration configuration
- **[Kubernetes Logs Integration](./kubernetes-logs-integration.md)** - Custom logs plugin documentation

### Component Management
- **[Scripts Documentation](../scripts/README.md)** - Component import and catalog generation tools

### Troubleshooting
- **[Production Issues](./troubleshooting/production-issues.md)** - Common production problems and solutions
- **[GitHub Auth Port Issue](./troubleshooting/github-auth-port-issue.md)** - Specific authentication troubleshooting

## Features Overview

### Enhanced Kubernetes Integration ✅
- **Full Resource Visibility**: View all Kubernetes resources (pods, services, deployments, configmaps, secrets, ingresses, etc.)
- **Multi-Cluster Support**: Monitor resources across 6 clusters (dev, test, stage, prod, sandbox, ss-prod)
- **Enhanced Pod Logs**: Advanced log viewing with deployment-level aggregation

### GitOps Integration ✅
- **Flux Plugin**: Monitor GitOps workflows and deployment status
- **Git Repository Tracking**: View Flux git repositories and sync status
- **Helm Release Management**: Track Helm deployments across clusters

### Component Import Tools ✅
- **Automated Catalog Generation**: Scripts to import existing CDCR applications
- **System-Level Organization**: Group components by system/domain
- **Team Management**: Automated user and team entity creation

### Authentication & Security
- **GitHub OAuth**: Primary authentication method for CDCR teams
- **Multi-Cluster RBAC**: Secure access to Kubernetes resources
- **Service Account Management**: Read-only access with proper permissions

## Quick Reference

### Important URLs
- **Production**: https://backstage.mt-dev.cdcr.ca.gov
- **Health Check**: https://backstage.mt-dev.cdcr.ca.gov/healthcheck

### Key Commands
```bash
# Check deployment status
kubectl get pods -n backstage

# View application logs
kubectl logs -f deployment/backstage -n backstage

# Generate component catalog
node scripts/generate-catalog.js

# Test health
curl https://backstage.mt-dev.cdcr.ca.gov/healthcheck
```

### Support
- **Platform Issues**: Review troubleshooting documentation first
- **Component Import**: See scripts documentation and examples
- **Authentication**: Check GitHub OAuth configuration and user entities
- **Plugin Issues**: Verify cluster connectivity and RBAC permissions

## Architecture

The CDCR Development Portal is deployed as a containerized application in Kubernetes with the following components:

- **Frontend**: React-based Backstage application
- **Backend**: Node.js API server with plugin integrations
- **Database**: PostgreSQL for catalog and configuration storage
- **Authentication**: GitHub OAuth integration
- **Plugins**: Kubernetes, GitOps, Logs, GitHub Actions, and TechDocs

## Recent Updates

### Latest Enhancements ✅
- **Kubernetes Plugin**: Now fetches all resource types (previously limited to pods, services, deployments, replicasets)
- **GitOps Plugin**: Added Flux integration for GitOps workflow visibility
- **Component Import**: Enhanced scripts for automated catalog generation
- **Production Documentation**: Comprehensive deployment and troubleshooting guides

### Configuration Changes
- **app-config.yaml**: Removed `objectTypes` limitation for full Kubernetes resource access
- **Entity Annotations**: Added GitOps annotations for Flux integration
- **RBAC**: Enhanced permissions for all Kubernetes resources and Flux CRDs