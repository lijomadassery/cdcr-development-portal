# SS-PROD Deployment Configuration

## Overview

This document provides the specific configuration and steps for deploying the CDCR Development Portal to the **ss-prod** cluster.

## Cluster-Specific Information

- **Cluster Name**: ss-prod
- **Domain**: backstage.mt-dev.cdcr.ca.gov
- **Environment**: Production (ss-prod)
- **Database**: Managed PostgreSQL
- **Authentication**: GitHub OAuth

## Quick Deployment Checklist

### Prerequisites ✅
- [ ] kubectl configured for ss-prod cluster
- [ ] GitHub OAuth app configured for production domain
- [ ] PostgreSQL database created and accessible
- [ ] Service account tokens for all 6 clusters (dev, test, stage, prod, sandbox, ss-prod)
- [ ] GitHub personal access token with required scopes

### Pre-Deployment Steps
1. **Verify cluster access**:
   ```bash
   kubectl config current-context
   # Should show ss-prod cluster
   ```

2. **Create namespace and RBAC**:
   ```bash
   kubectl apply -f kubernetes/base/namespace.yaml
   ```

3. **Configure secrets** (see production guide for full template):
   ```bash
   kubectl create secret generic backstage-secrets \
     --from-literal=AUTH_GITHUB_CLIENT_ID="your-client-id" \
     --from-literal=AUTH_GITHUB_CLIENT_SECRET="your-client-secret" \
     --from-literal=GITHUB_TOKEN="your-github-token" \
     --from-literal=POSTGRES_HOST="your-postgres-host" \
     --from-literal=POSTGRES_PASSWORD="your-postgres-password" \
     --from-literal=KUBERNETES_SS_PROD_URL="https://your-ss-prod-api" \
     --from-literal=KUBERNETES_SS_PROD_SA_TOKEN="your-ss-prod-token" \
     # ... add all other cluster tokens
     -n backstage
   ```

### Component Import (Run Before Deployment)
1. **Install dependencies**:
   ```bash
   npm install js-yaml
   ```

2. **Configure your projects** in `scripts/generate-catalog.js`

3. **Generate catalog files**:
   ```bash
   node scripts/generate-catalog.js
   ```

### Deployment
1. **Deploy application**:
   ```bash
   kubectl apply -f kubernetes/environments/production/backstage-deployment.yaml
   ```

2. **Verify deployment**:
   ```bash
   kubectl get pods -n backstage
   kubectl logs -f deployment/backstage -n backstage
   ```

3. **Configure DNS**:
   ```bash
   # Point backstage.mt-dev.cdcr.ca.gov to ingress IP
   kubectl get ingress backstage -n backstage
   ```

### Post-Deployment Verification
- [ ] Application loads at https://backstage.mt-dev.cdcr.ca.gov
- [ ] GitHub authentication works
- [ ] Kubernetes tab shows resources from all 6 clusters
- [ ] GitOps tab displays (if Flux is installed)
- [ ] Pod Logs functionality works
- [ ] Generated components appear in catalog

## Environment Variables for SS-PROD

The following environment variables are required in the secret for ss-prod deployment:

```bash
# GitHub Integration
AUTH_GITHUB_CLIENT_ID=your-production-github-oauth-client-id
AUTH_GITHUB_CLIENT_SECRET=your-production-github-oauth-client-secret
GITHUB_TOKEN=your-github-personal-access-token

# Database (Managed PostgreSQL)
POSTGRES_HOST=your-managed-postgres-host
POSTGRES_PORT=5432
POSTGRES_USER=backstage
POSTGRES_PASSWORD=your-secure-database-password

# Kubernetes Clusters (all 6 clusters)
KUBERNETES_DEV_URL=https://your-dev-cluster-api-server
KUBERNETES_DEV_SA_TOKEN=your-dev-cluster-service-account-token

KUBERNETES_TEST_URL=https://your-test-cluster-api-server
KUBERNETES_TEST_SA_TOKEN=your-test-cluster-service-account-token

KUBERNETES_STAGE_URL=https://your-stage-cluster-api-server
KUBERNETES_STAGE_SA_TOKEN=your-stage-cluster-service-account-token

KUBERNETES_PROD_URL=https://your-prod-cluster-api-server
KUBERNETES_PROD_SA_TOKEN=your-prod-cluster-service-account-token

KUBERNETES_SANDBOX_URL=https://your-sandbox-cluster-api-server
KUBERNETES_SANDBOX_SA_TOKEN=your-sandbox-cluster-service-account-token

KUBERNETES_SS_PROD_URL=https://your-ss-prod-cluster-api-server
KUBERNETES_SS_PROD_SA_TOKEN=your-ss-prod-cluster-service-account-token
```

## Common ss-prod Issues

### Issue 1: Can't Access ss-prod Cluster Resources
**Problem**: Backstage deployed to ss-prod but can't see resources from ss-prod itself.

**Solution**: Ensure the ss-prod service account token has proper permissions:
```bash
# Verify service account exists in ss-prod
kubectl get serviceaccount backstage-viewer -n default

# Test permissions
kubectl auth can-i get pods --as=system:serviceaccount:default:backstage-viewer
kubectl auth can-i get deployments --as=system:serviceaccount:default:backstage-viewer
```

### Issue 2: Cross-Cluster Access Not Working
**Problem**: Can see ss-prod resources but not other clusters.

**Solution**: Verify all cluster tokens are valid and have network connectivity:
```bash
# Test each cluster token
kubectl --token=$KUBERNETES_DEV_SA_TOKEN --server=$KUBERNETES_DEV_URL get pods
kubectl --token=$KUBERNETES_TEST_SA_TOKEN --server=$KUBERNETES_TEST_URL get pods
# ... test all clusters
```

## Monitoring ss-prod Deployment

### Health Checks
```bash
# Application health
curl https://backstage.mt-dev.cdcr.ca.gov/healthcheck

# Pod status
kubectl get pods -n backstage

# Resource usage
kubectl top pods -n backstage
```

### Log Monitoring
```bash
# Application logs
kubectl logs -f deployment/backstage -n backstage

# Filter for errors
kubectl logs deployment/backstage -n backstage | grep -i error
```

## Backup and Recovery for ss-prod

### Database Backup
```bash
# Backup catalog database
pg_dump -h your-postgres-host -U backstage backstage_plugin_catalog > backup-$(date +%Y%m%d).sql
```

### Configuration Backup
All configurations are stored in git and can be restored from the repository.

### Disaster Recovery
1. Redeploy from git repository
2. Restore database from backup
3. Recreate secrets with stored credentials
4. Verify all cluster connectivity

## Support Contacts for ss-prod

- **Platform Team**: For ss-prod cluster access and infrastructure
- **Database Team**: For managed PostgreSQL issues
- **Network Team**: For connectivity between clusters
- **Security Team**: For service account token management