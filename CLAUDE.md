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

## Technical Implementation Details

### Authentication Configuration
```yaml
# app-config.yaml
auth:
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
      production:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}

signIn:
  resolvers:
    - resolver: usernameMatchingUserEntityName
    - resolver: emailMatchingUserEntityProfileEmail
    - resolver: emailLocalPartMatchingUserEntityName
```

### Kubernetes Integration
```yaml
# Multi-cluster configuration with service account tokens
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: ${KUBERNETES_DEV_URL}
          name: dev
          authProvider: 'serviceAccount'
          serviceAccountToken: ${KUBERNETES_DEV_SA_TOKEN}
        # ... (additional clusters)
```

### Plugin Architecture
- **@backstage/plugin-kubernetes:** Multi-cluster resource monitoring
- **@backstage/plugin-flux:** GitOps workflow integration
- **@backstage/plugin-github-actions:** CI/CD pipeline visibility
- **@backstage/plugin-techdocs:** Documentation system
- **@backstage/plugin-scaffolder:** Template-based service creation
- **@backstage/plugin-catalog-import:** Component registration

## File Structure

### Key Configuration Files
- `app-config.yaml` - Main Backstage configuration
- `app-config.production.yaml` - Production-specific settings
- `packages/app/src/App.tsx` - Frontend application setup
- `packages/app/src/apis.ts` - API configuration and authentication
- `packages/backend/src/index.ts` - Backend service configuration

### Deployment Files
- `kubernetes/` - Complete Kubernetes deployment manifests
- `Dockerfile` - Multi-stage container build
- `.github/workflows/` - CI/CD pipeline for automated builds
- `docs/deployment-guide.md` - Comprehensive deployment instructions

### Catalog & Templates
- `catalog/` - CDCR team and application definitions
- `templates/` - Service scaffolding templates
- `examples/` - Sample component definitions

### Custom Components (Cleaned)
- `packages/app/src/themes/simpleCdcrTheme.ts` - CDCR branding theme
- `packages/app/src/components/auth/ModernSignInPage.tsx` - Custom sign-in (reference)

## Environment Variables

### Required for Local Development
```bash
# GitHub OAuth
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Kubernetes Clusters (6 total)
KUBERNETES_DEV_URL=https://dev-cluster-endpoint
KUBERNETES_DEV_SA_TOKEN=dev-service-account-token
# ... (repeat for test, stage, prod, sandbox, ss-prod)
```

### Required for Production
- Same as development plus production-specific endpoints
- Kubernetes service account tokens for all 6 clusters
- Production GitHub OAuth app credentials
- Managed PostgreSQL connection details

## Development Commands

### Essential Commands
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Type checking
yarn tsc

# Linting
yarn lint
```

### Docker Commands
```bash
# Build image
docker build -t ghcr.io/lijomadassery/backstage:latest .

# Run locally
docker run -p 7007:7007 --env-file .env ghcr.io/lijomadassery/backstage:latest
```

## Deployment Process

### Production Deployment Steps
1. **Verify Docker Image:** Check GitHub Actions built latest image
2. **Create Namespace:** Apply Kubernetes namespace and RBAC
3. **Configure Secrets:** Update with production credentials
4. **Deploy Database:** PostgreSQL with persistent storage
5. **Deploy Application:** Backstage with ingress and SSL
6. **Verify Integration:** Test all plugins and authentication
7. **DNS Configuration:** Point domain to ingress IP

### Post-Deployment Verification
- GitHub OAuth authentication works
- All 6 Kubernetes clusters accessible
- Flux GitOps data displays correctly
- GitHub Actions CI/CD integration functional
- Service catalog populated with CDCR applications

## Known Issues & Lessons Learned

### Authentication Challenges Resolved
- **Issue:** Custom sign-in pages broke authentication flow
- **Solution:** Use default Backstage SignInPage with custom providers
- **Lesson:** Backstage authentication is tightly coupled; avoid custom auth UI

### Theme Implementation
- **Issue:** Custom themes caused Element type errors
- **Solution:** Use createUnifiedTheme API with proper imports
- **Current State:** Working CDCR light/dark themes

### Plugin Integration
- **Issue:** Some desired plugins not available in npm registry
- **Solution:** Focus on officially supported plugins
- **Available:** Kubernetes, Flux, GitHub Actions, TechDocs

## Future Enhancements

### Planned Features
- Additional CDCR applications in catalog
- Enhanced monitoring and alerting integration
- Custom dashboards for operational metrics
- Advanced search functionality
- Security scanning integration

### Operational Improvements
- Automated backup and recovery procedures
- Performance optimization and caching
- Multi-region deployment capabilities
- Enhanced logging and observability

## Team Contacts & Resources

### Key Personnel
- **Platform Team:** Responsible for Backstage maintenance
- **Application Teams:** CDCR development teams using the portal
- **GitHub Organization:** Source code and OAuth app management

### External Dependencies
- **GitHub:** OAuth authentication and repository integration
- **Kubernetes Clusters:** 6 environments requiring service account access
- **Domain Management:** backstage.cdcr.ca.gov DNS configuration

## Security Considerations

### Implemented Security Measures
- GitHub OAuth with organization restrictions
- Kubernetes RBAC with read-only service accounts
- TLS/SSL certificates via cert-manager
- Secrets management in Kubernetes
- Container image security scanning

### Ongoing Security Requirements
- Regular service account token rotation
- GitHub OAuth app credential management
- Database security and backup encryption
- Network policy enforcement
- Audit logging and monitoring

---

## Network & Proxy Configuration (CRITICAL for CDCR)

### ZScaler Proxy Setup
Based on GitHub issue #29147, CDCR network requires specific proxy configuration:

**IMPORTANT:** Only use HTTPS_PROXY, not HTTP_PROXY to avoid 503 errors.

```yaml
# kubernetes/backstage-secrets.yaml
HTTPS_PROXY: "http://gateway.zscaler.net:80"  # Your actual ZScaler endpoint
NODE_TLS_REJECT_UNAUTHORIZED: "0"  # Required for ZScaler certificate inspection
```

### Backend Proxy Configuration
Added programmatic proxy support in `packages/backend/src/index.ts`:
```typescript
import * as https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Configure proxy if HTTPS_PROXY environment variable is set
if (process.env.HTTPS_PROXY) {
  https.globalAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
}
```

### Network Troubleshooting
- **ETIMEDOUT errors:** Indicates proxy configuration needed
- **503 errors:** Usually caused by setting both HTTP_PROXY and HTTPS_PROXY
- **Certificate errors:** Set NODE_TLS_REJECT_UNAUTHORIZED="0" for ZScaler

## Versioning & Releases

### Semantic Versioning
Project now uses semantic versioning with automated releases:
- **Current Version:** 1.0.3
- **Version File:** `VERSION` in root directory
- **Release Script:** `scripts/release.sh`

### Creating Releases
```bash
# Patch release (bug fixes)
./scripts/release.sh patch

# Minor release (new features)
./scripts/release.sh minor

# Major release (breaking changes)
./scripts/release.sh major
```

### Docker Image Tags
GitHub Actions automatically builds and tags:
- `ghcr.io/lijomadassery/backstage:1.0.3` (specific version)
- `ghcr.io/lijomadassery/backstage:1.0` (minor version)
- `ghcr.io/lijomadassery/backstage:latest` (latest stable)

## Recent Critical Fixes

### v1.0.3 - Network Proxy Fix
- Fixed GitHub API connectivity in CDCR network
- Implemented HTTPS-only proxy configuration
- Added programmatic proxy agent to backend
- Based on solution from backstage/backstage#29147

### v1.0.2 - Docker Build Fix
- Fixed invalid Docker tag format in GitHub Actions
- Changed SHA prefix from {{branch}}- to sha-

### v1.0.1 - Theme Default Change
- Set CDCR Dark theme as default (light theme has display issues)
- Light theme still available via theme picker

## Deployment Instructions for Platform Engineers

### Latest Stable Release
**Version:** v1.0.3  
**Docker Image:** `ghcr.io/lijomadassery/backstage:1.0.3`  
**GitHub Release:** https://github.com/lijomadassery/cdcr-development-portal/releases/tag/v1.0.3

### Required Configuration
1. Update `backstage-secrets.yaml` with:
   - Actual ZScaler proxy URL (HTTPS_PROXY only)
   - Real GitHub OAuth credentials
   - Kubernetes service account tokens
   - PostgreSQL password

2. Deploy in order:
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   kubectl apply -f kubernetes/postgres.yaml
   kubectl apply -f kubernetes/backstage-secrets.yaml
   kubectl apply -f kubernetes/backstage-deployment.yaml
   kubectl apply -f kubernetes/network-policy.yaml  # if needed
   ```

### Post-Deployment Verification
1. Check pod status: `kubectl get pods -n backstage`
2. Check logs: `kubectl logs -f deployment/backstage -n backstage`
3. Test GitHub connectivity (try importing a catalog)
4. Verify all 6 Kubernetes clusters are accessible

---

**Last Updated:** 2025-06-30  
**Backstage Version:** Latest stable  
**Current Release:** v1.0.3  
**Deployment Status:** Production-ready with CDCR network fixes  
**Documentation Status:** Complete  
**Minikube Status:** Working with proper Kubernetes configuration