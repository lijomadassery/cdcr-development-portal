# CDCR Development Portal - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the CDCR Development Portal to the **ss-prod** cluster. This includes the latest enhancements: full Kubernetes resource visibility, GitOps plugin, and catalog component import tools.

## Quick Reference

- **Target Cluster**: ss-prod
- **Domain**: backstage.mt-dev.cdcr.ca.gov (current) or backstage.cdcr.ca.gov (future)
- **Database**: PostgreSQL (managed)
- **Authentication**: GitHub OAuth (primary)
- **Kubernetes Clusters**: 6 total (dev, test, stage, prod, sandbox, ss-prod)

## Prerequisites

### Required Access
- **Kubernetes Access**: Admin access to ss-prod cluster
- **Container Registry**: Access to GitHub Container Registry (ghcr.io)
- **Database**: PostgreSQL instance with admin access
- **DNS**: Ability to configure DNS records for domain

### Required Credentials
Gather these before starting deployment:

1. **GitHub OAuth Application**
   - Client ID and Secret for production domain
   - Configured callback URL: `https://backstage.mt-dev.cdcr.ca.gov/api/auth/github/handler/frame`

2. **GitHub Personal Access Token**
   - Scopes: `repo`, `read:org`, `read:user`, `workflow`
   - Used for repository integration and CI/CD visibility

3. **Kubernetes Service Account Tokens**
   - Tokens for all 6 clusters (dev, test, stage, prod, sandbox, ss-prod)
   - Read-only access with proper RBAC

4. **Database Credentials**
   - PostgreSQL host, port, username, password
   - Database name: `backstage_plugin_catalog`

### Required Tools
- kubectl (configured for ss-prod cluster)
- Docker (if building custom images)
- Node.js 20+ (for running import scripts)

## Step 1: Prepare the ss-prod Cluster

### 1.1 Create Namespace and RBAC

```bash
# Ensure kubectl is configured for ss-prod cluster
kubectl config current-context
# Should show ss-prod cluster context

# Create namespace and service accounts
kubectl apply -f kubernetes/base/namespace.yaml
```

This creates:
- `backstage` namespace
- Service account with cluster-wide read permissions
- RBAC for Kubernetes resources, Flux CRDs, and custom resources

### 1.2 Verify RBAC Permissions

```bash
# Test service account permissions
kubectl auth can-i get pods --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get deployments --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get configmaps --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get secrets --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get ingresses --as=system:serviceaccount:backstage:backstage

# Test Flux CRD access (for GitOps plugin)
kubectl auth can-i get gitrepositories --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get helmreleases --as=system:serviceaccount:backstage:backstage
```

## Step 2: Configure Secrets

### 2.1 Create Production Secrets

Create a temporary secrets file (DO NOT commit to git):

```bash
# Copy template and edit with real values
cp kubernetes/environments/production/secrets.yaml.example secrets-temp.yaml

# Edit with your actual credentials
vim secrets-temp.yaml
```

Required secret values:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backstage-secrets
  namespace: backstage
type: Opaque
stringData:
  # GitHub OAuth (from step 1 of prerequisites)
  AUTH_GITHUB_CLIENT_ID: "your-github-oauth-client-id"
  AUTH_GITHUB_CLIENT_SECRET: "your-github-oauth-client-secret"
  
  # GitHub Integration Token (from step 2 of prerequisites)
  GITHUB_TOKEN: "ghp_your-github-personal-access-token"
  
  # Database Connection (from step 4 of prerequisites)
  POSTGRES_HOST: "your-postgres-host"
  POSTGRES_PORT: "5432"
  POSTGRES_USER: "backstage"
  POSTGRES_PASSWORD: "your-secure-password"
  
  # Kubernetes Cluster Access (from step 3 of prerequisites)
  KUBERNETES_DEV_URL: "https://your-dev-cluster-api"
  KUBERNETES_DEV_SA_TOKEN: "your-dev-service-account-token"
  
  KUBERNETES_TEST_URL: "https://your-test-cluster-api"
  KUBERNETES_TEST_SA_TOKEN: "your-test-service-account-token"
  
  KUBERNETES_STAGE_URL: "https://your-stage-cluster-api"  
  KUBERNETES_STAGE_SA_TOKEN: "your-stage-service-account-token"
  
  KUBERNETES_PROD_URL: "https://your-prod-cluster-api"
  KUBERNETES_PROD_SA_TOKEN: "your-prod-service-account-token"
  
  KUBERNETES_SANDBOX_URL: "https://your-sandbox-cluster-api"
  KUBERNETES_SANDBOX_SA_TOKEN: "your-sandbox-service-account-token"
  
  KUBERNETES_SS_PROD_URL: "https://your-ss-prod-cluster-api"
  KUBERNETES_SS_PROD_SA_TOKEN: "your-ss-prod-service-account-token"
```

### 2.2 Apply Secrets

```bash
# Apply secrets to cluster
kubectl apply -f secrets-temp.yaml

# IMPORTANT: Remove the file with actual secrets
rm secrets-temp.yaml

# Verify secrets were created
kubectl get secrets -n backstage
kubectl describe secret backstage-secrets -n backstage
```

## Step 3: Set Up PostgreSQL Database

### 3.1 Option A: Use Managed PostgreSQL (Recommended)

If using a managed PostgreSQL service:

```bash
# Create database and user
psql -h your-postgres-host -U admin -d postgres
CREATE DATABASE backstage_plugin_catalog;
CREATE USER backstage WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE backstage_plugin_catalog TO backstage;
\q
```

### 3.2 Option B: Deploy PostgreSQL in Cluster

```bash
# Deploy PostgreSQL (only if not using managed service)
kubectl apply -f kubernetes/environments/production/postgres.yaml
```

### 3.3 Verify Database Connection

```bash
# Test connection from within cluster
kubectl run postgres-test --rm -i --tty --image=postgres:15 -- bash
psql -h your-postgres-host -U backstage -d backstage_plugin_catalog
\dt  # Should show empty database initially
\q
exit
```

## Step 4: Generate Component Catalog

The portal includes scripts to import existing CDCR components into the catalog.

### 4.1 Install Script Dependencies

```bash
# Install Node.js dependencies for catalog generation
npm install js-yaml
```

### 4.2 Configure Your Projects

Edit `scripts/generate-catalog.js` and update the `CDCR_PROJECTS` configuration with your actual systems:

```javascript
const CDCR_PROJECTS = {
  // Replace with your actual CDCR systems
  'your-system-name': {
    name: 'your-system-name',
    title: 'Your System Display Name',
    description: 'Description of your system',
    owner: 'your-team-name',
    components: [
      {
        name: 'your-frontend',
        title: 'Your Frontend Application',
        type: 'frontend',  // frontend, service, website
        description: 'Frontend application description',
        repo: 'your-org/your-frontend-repo',  // GitHub repo slug
        kubernetes: {
          namespace: 'your-namespace',
          labelSelector: 'app=your-frontend'
        },
        tags: ['frontend', 'react', 'your-tags']
      },
      {
        name: 'your-backend',
        title: 'Your Backend Service',
        type: 'service',
        description: 'Backend service description',
        repo: 'your-org/your-backend-repo',
        kubernetes: {
          namespace: 'your-namespace',
          labelSelector: 'app=your-backend'
        },
        tags: ['backend', 'api'],
        providesApis: ['your-api']
      }
    ],
    apis: [
      {
        name: 'your-api',
        title: 'Your API',
        type: 'rest',
        description: 'API description',
        owner: 'your-team-name'
      }
    ]
  }
};
```

### 4.3 Configure Teams

Update the `CDCR_TEAMS` configuration with your actual team members:

```javascript
const CDCR_TEAMS = {
  'your-team-name': {
    name: 'your-team-name',
    displayName: 'Your Team Display Name',
    description: 'Team description',
    type: 'team',
    members: [
      {
        name: 'john.doe',
        displayName: 'John Doe',
        email: 'john.doe@cdcr.ca.gov'
      }
      // Add more team members
    ]
  }
};
```

### 4.4 Generate Catalog Files

```bash
# Run the catalog generation script
node scripts/generate-catalog.js
```

This creates:
- `catalog/your-system-name-system.yaml` - One file per system with all components
- `catalog/cdcr-teams.yaml` - Teams and users
- Updates `app-config.yaml` with references to generated files

### 4.5 Review Generated Files

```bash
# Check generated catalog files
ls -la catalog/
cat catalog/your-system-name-system.yaml
cat catalog/cdcr-teams.yaml
```

The files are now ready to be read by Backstage during startup.

## Step 5: Deploy Backstage Application

### 5.1 Verify Container Image

The application is automatically built via GitHub Actions:

```bash
# Check if latest image is available
docker pull ghcr.io/lijomadassery/backstage:latest

# Or check specific version
docker pull ghcr.io/lijomadassery/backstage:v1.0.0
```

### 5.2 Deploy Application

```bash
# Deploy all components
kubectl apply -f kubernetes/environments/production/backstage-deployment.yaml

# Check deployment status
kubectl get pods -n backstage
kubectl get services -n backstage
kubectl get ingress -n backstage
```

### 5.3 Monitor Deployment

```bash
# Watch pods come up
kubectl get pods -n backstage -w

# Check application logs
kubectl logs -f deployment/backstage -n backstage

# Check for any errors
kubectl describe pod <pod-name> -n backstage
```

## Step 6: Configure Ingress and SSL

### 6.1 Verify Ingress Configuration

The deployment includes ingress configuration for `backstage.mt-dev.cdcr.ca.gov`. Verify it's correctly configured:

```bash
# Check ingress details
kubectl describe ingress backstage -n backstage

# Verify TLS certificate
kubectl get certificate -n backstage
```

### 6.2 Configure DNS

Point your domain to the ingress controller:

```bash
# Get ingress external IP
kubectl get ingress backstage -n backstage

# Configure DNS A record:
# backstage.mt-dev.cdcr.ca.gov -> <ingress-external-ip>
```

### 6.3 Test SSL Certificate

```bash
# Test HTTPS connectivity
curl -I https://backstage.mt-dev.cdcr.ca.gov

# Check certificate details
openssl s_client -connect backstage.mt-dev.cdcr.ca.gov:443 -servername backstage.mt-dev.cdcr.ca.gov
```

## Step 7: Verify Deployment

### 7.1 Health Checks

```bash
# Test application health
curl https://backstage.mt-dev.cdcr.ca.gov/healthcheck

# Check catalog API
curl https://backstage.mt-dev.cdcr.ca.gov/api/catalog/entities
```

### 7.2 Test Authentication

1. Open https://backstage.mt-dev.cdcr.ca.gov
2. Click "Sign In"
3. Authenticate with GitHub
4. Verify you can access the portal

### 7.3 Verify Plugin Functionality

#### Kubernetes Plugin (Enhanced)
1. Navigate to any component with Kubernetes annotations
2. Click "Kubernetes" tab
3. Verify you can see:
   - ✅ Pods, Services, Deployments (basic resources)
   - ✅ ConfigMaps, Secrets (configuration resources)  
   - ✅ Ingresses (network resources)
   - ✅ All resources from all 6 clusters

#### GitOps Plugin
1. Navigate to a service component
2. Click "GitOps" tab
3. Verify GitOps resources are displayed (if Flux is installed)

#### Pod Logs Plugin
1. Navigate to any component
2. Click "Pod Logs" tab
3. Test log viewing functionality

#### GitHub Integration
1. Navigate to any component with GitHub annotations
2. Click "CI/CD" tab
3. Verify GitHub Actions workflows are displayed

## Step 8: Post-Deployment Configuration

### 8.1 Label Kubernetes Resources

For resources to appear in Backstage, they need proper labels:

```bash
# Label existing resources in your clusters
kubectl label deployment your-app backstage.io/kubernetes-id=your-component-name
kubectl label service your-app backstage.io/kubernetes-id=your-component-name
kubectl label configmap your-app-config backstage.io/kubernetes-id=your-component-name
kubectl label secret your-app-secret backstage.io/kubernetes-id=your-component-name
kubectl label ingress your-app backstage.io/kubernetes-id=your-component-name
```

### 8.2 Configure Monitoring

Set up monitoring for:
- Application health and performance
- Database connections and query performance
- Kubernetes resource usage
- External API connectivity (GitHub, cluster APIs)

### 8.3 Set Up Backups

```bash
# Database backups (adjust for your PostgreSQL setup)
pg_dump -h your-postgres-host -U backstage backstage_plugin_catalog > backup.sql

# Configuration backups (version controlled)
git add kubernetes/ catalog/ app-config.yaml
git commit -m "Production deployment configuration"
git push
```

## Troubleshooting

### Common Issues

#### Pod Won't Start
```bash
# Check pod status and events
kubectl describe pod <pod-name> -n backstage
kubectl logs <pod-name> -n backstage

# Common causes:
# - Missing secrets
# - Database connection issues
# - Image pull errors
```

#### Database Connection Errors
```bash
# Verify database connectivity
kubectl exec -it deployment/backstage -n backstage -- bash
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d backstage_plugin_catalog

# Common causes:
# - Wrong credentials in secrets
# - Network connectivity issues
# - Database not accepting connections
```

#### Kubernetes Plugin Shows Limited Resources
```bash
# Check service account permissions
kubectl auth can-i get configmaps --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get secrets --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get ingresses --as=system:serviceaccount:backstage:backstage

# Verify cluster tokens are valid
kubectl --token=$KUBERNETES_DEV_SA_TOKEN --server=$KUBERNETES_DEV_URL get pods
```

#### GitOps Plugin Not Working
```bash
# Check if Flux CRDs exist in target clusters
kubectl get crd | grep toolkit.fluxcd.io

# Verify Flux resources have proper labels
kubectl get gitrepositories -A --show-labels
```

#### Authentication Issues
- Verify GitHub OAuth app callback URL matches deployment domain
- Check GitHub token permissions and scopes
- Confirm user entities exist in catalog

#### SSL/TLS Issues
```bash
# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Verify certificate status
kubectl describe certificate backstage -n backstage
```

### Performance Tuning

#### Database Optimization
```sql
-- Check database performance
SELECT * FROM pg_stat_activity WHERE datname = 'backstage_plugin_catalog';

-- Optimize queries (run as database admin)
ANALYZE;
VACUUM;
```

#### Application Scaling
```yaml
# Increase replicas for high availability
spec:
  replicas: 3
  
# Adjust resource limits based on usage
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi" 
    cpu: "500m"
```

### Useful Commands

```bash
# Get all resources in backstage namespace
kubectl get all -n backstage

# Check resource usage
kubectl top pods -n backstage

# View application logs (all pods)
kubectl logs -f deployment/backstage -n backstage

# Port forward for local debugging
kubectl port-forward service/backstage 7007:7000 -n backstage

# Update deployment with new image
kubectl set image deployment/backstage backstage=ghcr.io/lijomadassery/backstage:v1.1.0 -n backstage

# Restart deployment
kubectl rollout restart deployment/backstage -n backstage
```

## Security Considerations

### Secrets Management
- Use external secret management systems (Azure Key Vault, AWS Secrets Manager)
- Rotate service account tokens regularly
- Limit RBAC permissions to minimum required

### Network Security
- Enable network policies to restrict pod communication
- Use TLS for all external connections
- Consider using a service mesh for advanced security

### Access Control
- Configure proper GitHub OAuth scopes
- Review team memberships and permissions regularly
- Monitor access logs and unusual activity

## Maintenance

### Regular Tasks
- **Weekly**: Check application logs and performance metrics
- **Monthly**: Update container images and security patches
- **Quarterly**: Rotate service account tokens and certificates
- **Annually**: Review team memberships and access permissions

### Updates
```bash
# Update to new version
docker pull ghcr.io/lijomadassery/backstage:latest
kubectl set image deployment/backstage backstage=ghcr.io/lijomadassery/backstage:latest -n backstage
kubectl rollout status deployment/backstage -n backstage
```

### Disaster Recovery
- Maintain offsite database backups
- Document all configuration and credential requirements
- Test recovery procedures in non-production environment
- Keep deployment scripts and documentation version controlled

## Support

### Documentation
- [Kubernetes Plugin Setup Guide](./kubernetes-plugin-setup-guide.md)
- [Troubleshooting Guide](./troubleshooting/)
- [Scripts Documentation](../scripts/README.md)

### Logs and Monitoring
- Application logs: `kubectl logs -f deployment/backstage -n backstage`
- Health check: `https://backstage.mt-dev.cdcr.ca.gov/healthcheck`
- Database logs: Check your PostgreSQL service logs

### Getting Help
- Review existing documentation in `/docs` folder
- Check GitHub Actions for build/deployment issues
- Verify all prerequisites are met before deployment
- Test in development environment first