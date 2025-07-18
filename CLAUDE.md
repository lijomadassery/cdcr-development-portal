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
m
## Build Plugin Memory
- Initial setup of custom build plugin for tracking application builds
- Integration with GitHub Actions for real-time build status
- Support for multi-cluster build tracking and deployment pipelines
- **Custom Plugin Implementation for Logs:** Added custom logging plugin to track and aggregate logs across different Kubernetes clusters

## Log Window & Deployment Logs Feature ✅
- **Individual Pod Logs**: Custom log window plugin for tracking application logs across multiple Kubernetes clusters
- **Deployment Logs Feature (NEW)**: Tabbed interface for viewing logs from all pods in a deployment simultaneously
  - DeploymentLogsModal component with color-coded tabs and status indicators
  - useDeploymentLogs hook for concurrent log fetching from multiple pods
  - Pod grouping by deployment ownership (ReplicaSet pattern)
  - Search, follow, timestamps, and download all logs functionality
  - **Critical**: Only appears for deployments with >1 pod (expected behavior)
  - **Testing**: Scale deployment with `kubectl scale deployment backstage --replicas=2`
  - **Location**: Pod Logs tab → "Applications (Grouped Pods)" section → "View All Logs (X)" buttons
- Provides centralized log aggregation and real-time log streaming
- Supports filtering and searching logs by namespace, pod, and time range
- Integrated with Kubernetes API for seamless log retrieval

---

## Complete Local Development Deployment Process (July 16, 2025)

### Summary of Issues Resolved
This session fixed multiple critical issues that were preventing reliable local deployment:

1. **KubernetesApi Constructor Error** - Fixed incorrect import path
2. **Port 7000 Conflicts** - Resolved macOS Control Center AirPlay service conflict
3. **JWT Token Verification Failures** - Fixed authentication between frontend/backend
4. **GitHub OAuth Callback Mismatch** - Aligned all port configurations
5. **Configuration Inconsistencies** - Synchronized ConfigMap and deployment env vars

### Root Causes Identified
- **Import Error:** `KubernetesApi` was imported from `@backstage/plugin-kubernetes-common` instead of `@backstage/plugin-kubernetes`
- **Port Conflicts:** macOS Control Center occupies port 7000 for AirPlay service
- **Configuration Misalignment:** Environment variables in deployment overrode ConfigMap settings
- **JWT Key Rotation:** Pod restarts generate new JWT keys requiring fresh user tokens

### Complete Step-by-Step Process

#### Prerequisites
- Minikube running with backstage-local namespace
- GitHub OAuth app configured
- Docker environment configured for minikube

#### Step 1: Fix KubernetesApi Import (One-time fix)
```bash
# Fix the import in packages/app/src/apis.ts
# Change from:
import { kubernetesApiRef, KubernetesApi } from '@backstage/plugin-kubernetes-common';
# To:
import { kubernetesApiRef, KubernetesApi } from '@backstage/plugin-kubernetes';
```

#### Step 2: Handle macOS Port 7000 Conflicts
```bash
# Check if port 7000 is occupied by Control Center
lsof -i :7000

# If Control Center is using port 7000, update configurations to use port 7001
```

#### Step 3: Update GitHub OAuth Callback URL
Update GitHub OAuth app settings:
- **Old:** `http://127.0.0.1:7000/api/auth/github/handler/frame`
- **New:** `http://127.0.0.1:7001/api/auth/github/handler/frame`

#### Step 4: Synchronize All Port Configurations

**A. Update ConfigMap:**
```yaml
# kubernetes/environments/local/app-config-local.yaml
app:
  baseUrl: http://127.0.0.1:7001
backend:
  baseUrl: http://127.0.0.1:7001
  cors:
    origin: http://127.0.0.1:7001
```

**B. Update Deployment Environment Variables:**
```yaml
# kubernetes/environments/local/backstage-deployment.yaml
env:
- name: APP_CONFIG_app_baseUrl
  value: "http://127.0.0.1:7001"
- name: APP_CONFIG_backend_baseUrl  
  value: "http://127.0.0.1:7001"
```

#### Step 5: Build and Deploy
```bash
# 1. Set minikube docker environment
eval $(minikube docker-env)

# 2. Build local image with fixes
docker build -t backstage:fixed-kubernetes-api .

# 3. Apply updated configurations
kubectl apply -f kubernetes/environments/local/app-config-local.yaml
kubectl apply -f kubernetes/environments/local/backstage-deployment.yaml

# 4. Update deployment to use new image
kubectl set image deployment/backstage backstage=backstage:fixed-kubernetes-api -n backstage-local

# 5. Wait for rollout to complete
kubectl rollout status deployment/backstage -n backstage-local
```

#### Step 6: Setup Port Forwarding
```bash
# Port forward to 7001 (avoiding Control Center conflict)
kubectl port-forward service/backstage 7001:7000 -n backstage-local &

# Test connectivity
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7001
# Should return: 200
```

#### Step 7: Access and Test Application
1. **Access:** http://127.0.0.1:7001
2. **Login:** Use GitHub OAuth 
3. **Verify:** Check catalog loads without "Failed to load entity kinds"
4. **Test Kubernetes Plugin:** Click Kubernetes tab
5. **If JWT errors:** Logout and login again to refresh user token

### Troubleshooting Common Issues

#### Port Forward Dies After Pod Restarts
```bash
# Check if port forward is running
ps aux | grep "kubectl port-forward" | grep -v grep

# Restart if needed
kubectl port-forward service/backstage 7001:7000 -n backstage-local &
```

#### JWT Token Verification Errors
When you see: `Failed to verify incoming user token no applicable key found in the JSON Web Key Set`

**Solution:** Logout and login again in the browser to get fresh token

#### Configuration Precedence
Remember: **Deployment environment variables override ConfigMap values**
- Always update both ConfigMap AND deployment env vars
- Environment variables in deployment take precedence

#### Kubernetes Plugin 401 Errors
If clicking Kubernetes tab shows 401 errors:
1. Check logs: `kubectl logs deployment/backstage -n backstage-local --tail=20`
2. Look for JWT verification warnings
3. Logout/login to refresh user token

### Quick Commands Reference
```bash
# Build and deploy cycle
eval $(minikube docker-env)
docker build -t backstage:$(date +%s) .
kubectl set image deployment/backstage backstage=backstage:$(date +%s) -n backstage-local
kubectl port-forward service/backstage 7001:7000 -n backstage-local &

# Troubleshooting
kubectl get pods -n backstage-local
kubectl logs deployment/backstage -n backstage-local --tail=20
kubectl rollout restart deployment/backstage -n backstage-local

# Check port conflicts
lsof -i :7000
lsof -i :7001
```

### Key Lessons Learned
1. **Always check port conflicts** on macOS before assuming configuration issues
2. **Environment variables override ConfigMaps** - update both consistently  
3. **JWT keys rotate on pod restart** - logout/login resolves token mismatches
4. **Import paths matter** - use correct package for KubernetesApi
5. **Test each step incrementally** - don't batch multiple changes

### Final Working Configuration
- **Image:** `backstage:fixed-kubernetes-api`
- **Access URL:** http://127.0.0.1:7001
- **GitHub OAuth:** Configured for port 7001
- **Port Forward:** `7001:7000` (avoiding Control Center)
- **All configs aligned:** ConfigMap, deployment env vars, OAuth callback

**Status:** ✅ Fully functional with Kubernetes plugin working
**Date:** July 16, 2025
**Next Steps:** Commit changes and create formal release once tested

## Save
- Added memory about saving configurations and best practices for local development deployment