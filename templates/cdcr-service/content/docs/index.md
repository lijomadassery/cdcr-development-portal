# ${{ values.name | title }} Documentation

Welcome to the documentation for ${{ values.name | title }}.

## Service Overview

${{ values.description }}

## Table of Contents

- [API Documentation](api.md)
- [Deployment Guide](deployment.md) 
- [Troubleshooting](troubleshooting.md)

## Getting Started

This service follows CDCR standards for development and deployment. It includes:

- **Standardized project structure**
- **CI/CD pipelines** with GitHub Actions
- **Kubernetes deployment** manifests
- **Monitoring and logging** integration
- **Security scanning** and compliance checks

## Team Information

- **Owner:** ${{ values.owner }}
- **Lifecycle:** ${{ values.lifecycle }}
- **Repository:** ${{ values.repoUrl }}

## Quick Links

- [View in Backstage Catalog](../../)
- [GitHub Repository](${{ values.repoUrl }})
- [Kubernetes Dashboard](#) (TODO: Add link)
- [Monitoring Dashboard](#) (TODO: Add link)