# CDCR Development Portal - Claude Memory

## Project Overview

**Project Name:** CDCR Development Portal  
**Framework:** Backstage.io  
**Purpose:** Unified developer portal for California Department of Corrections and Rehabilitation (CDCR) applications across 6 Kubernetes clusters  
**Authentication:** GitHub OAuth (primary method)  
**Status:** Production-ready with working authentication and multi-cluster support  
**Local Deployment:** Minikube deployment running but catalog files need mounting fix

## Architecture

### Core Technologies
- **Frontend:** React + TypeScript (Backstage framework)
- **Backend:** Node.js + Express (Backstage backend)
- **Database:** PostgreSQL
- **Authentication:** GitHub OAuth with sign-in resolvers
- **Container:** Docker with multi-stage builds
- **Orchestration:** Kubernetes with Helm-style manifests
- **GitOps:** Flux integration for deployment monitoring

### Infrastructure
- **Clusters:** 6 Kubernetes clusters (dev, test, stage, prod, sandbox, ss-prod)
- **Domain:** backstage.cdcr.ca.gov (production)
- **SSL/TLS:** Cert-manager with automatic certificate management
- **Ingress:** Nginx ingress controller
- **Monitoring:** Integrated Kubernetes resource monitoring

## Completed Features

### ✅ Authentication & Authorization
- **GitHub OAuth Integration:** Full working authentication with proper sign-in resolvers
- **User Management:** User entities defined in catalog for team members
- **Sign-in Resolvers:** Username, email, and email local part matching
- **Team Membership:** Automatic team assignment based on catalog configuration

### ✅ Multi-Cluster Kubernetes Integration
- **6 Cluster Support:** Dev, test, stage, prod, sandbox, ss-prod environments
- **Service Account Setup:** Read-only access with proper RBAC permissions
- **Resource Monitoring:** Pods, deployments, services, and custom resources
- **Cross-Cluster Visibility:** Unified view of applications across all environments

### ✅ GitOps & CI/CD Integration
- **Flux Plugin:** GitOps workflow monitoring and Git repository tracking
- **GitHub Actions Integration:** CI/CD pipeline visibility and build status
- **Repository Management:** GitHub integration for source code management
- **Deployment Tracking:** Real-time deployment status across clusters

### ✅ Service Catalog & Templates
- **Component Catalog:** Centralized registry of CDCR applications and services
- **Software Templates:** Standardized scaffolding for new service creation
- **Team Ownership:** Metadata tracking for application ownership
- **Dependency Mapping:** Service relationships and API documentation

### ✅ Documentation & Knowledge Management
- **TechDocs Integration:** Automated documentation from Markdown sources
- **API Documentation:** OpenAPI spec integration and exploration
- **Deployment Guides:** Comprehensive setup and operational documentation
- **Search Functionality:** Full-text search across catalog and documentation

### ✅ Production Deployment
- **Docker Images:** Multi-stage optimized builds with GitHub Actions CI/CD
- **Kubernetes Manifests:** Complete deployment configuration with secrets management
- **Production Configuration:** Environment-specific settings and security hardening
- **Health Checks:** Application monitoring and readiness probes

### ✅ Branding & Theming
- **CDCR Theme:** Custom light/dark themes with CDCR branding colors
- **UI Customization:** Custom styling with Material-UI components
- **Sign-in Page:** Default Backstage sign-in with GitHub provider
- **Responsive Design:** Mobile-friendly interface

## Ports Memory

### Port Configuration Notes
- **GitHub OAuth Callback:** Uses port 7000 
- **Backstage Service:** Primary port 7000, container runs on 7007
- **Minikube Deployment:** Requires specific port forwarding configuration
- **Local Development:** Ensure port consistency across OAuth, service, and forwarding settings
- **Important:** Always use 127.0.0.1 instead of localhost for GitHub OAuth callbacks
- **Port Mapping:** Critical for successful authentication and service discovery

(Rest of the file remains unchanged)