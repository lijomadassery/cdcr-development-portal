# CDCR Development Portal - Deployment Guide

## Overview

This guide covers deploying the CDCR Development Portal to your Kubernetes clusters.

## Prerequisites

### Required Tools
- Docker
- kubectl configured for your target cluster
- Access to build and push container images
- Cluster admin permissions for RBAC setup

### Cluster Requirements
- Kubernetes 1.20+
- Ingress controller (nginx recommended)
- Cert-manager for SSL certificates
- Persistent storage for PostgreSQL

## Step-by-Step Deployment

### 1. Choose Target Cluster

**Recommended:** Start with your `dev` cluster for initial testing.

```bash
# Set kubectl context to dev cluster  
kubectl config use-context your-dev-cluster
```

### 2. Verify Docker Image

The Docker image is automatically built via GitHub Actions. Before deploying, verify the image is available:

```bash
# Check if image exists and is recent
docker pull ghcr.io/lijomadassery/backstage:latest
```

The deployment manifest (`kubernetes/backstage-deployment.yaml`) is already configured to use:
```
ghcr.io/lijomadassery/backstage:latest
```

**Alternative:** Build manually if needed:
```bash
docker build -t ghcr.io/lijomadassery/backstage:latest .
docker push ghcr.io/lijomadassery/backstage:latest
```

### 3. Create Kubernetes Namespace and RBAC

```bash
kubectl apply -f kubernetes/namespace.yaml
```

This creates:
- `backstage` namespace
- Service account with cluster-wide read permissions
- RBAC for accessing Kubernetes resources and Flux objects

### 4. Set Up PostgreSQL Database

```bash
kubectl apply -f kubernetes/postgres.yaml
```

### 5. Configure Secrets

**Important:** Update the secret values before applying!

```bash
# Copy the template
cp kubernetes/backstage-secrets.yaml kubernetes/backstage-secrets-actual.yaml

# Edit with your actual values
# - GitHub tokens and OAuth credentials
# - Database passwords
# - Kubernetes cluster service account tokens
vim kubernetes/backstage-secrets-actual.yaml

# Apply the secrets
kubectl apply -f kubernetes/backstage-secrets-actual.yaml

# Remove the file with actual secrets (don't commit to git!)
rm kubernetes/backstage-secrets-actual.yaml
```

### 6. Get Service Account Tokens for Each Cluster

For each of your 6 clusters, you need to create service accounts and get their tokens:

```bash
# On each cluster, create the backstage service account
kubectl create serviceaccount backstage-viewer -n default
kubectl create clusterrolebinding backstage-viewer \
  --clusterrole=view \
  --serviceaccount=default:backstage-viewer

# Get the token (Kubernetes 1.24+)
kubectl create token backstage-viewer -n default --duration=8760h

# Get cluster endpoint
kubectl cluster-info

# Get CA certificate
kubectl get secret $(kubectl get sa backstage-viewer -n default -o jsonpath='{.secrets[0].name}') \
  -n default -o jsonpath='{.data.ca\.crt}'
```

Add these values to your secrets configuration.

### 7. Update Domain Configuration (If Needed)

The deployment is pre-configured for `backstage.cdcr.ca.gov`. If you need a different domain:

1. **Update production config** in `app-config.production.yaml`:
   ```yaml
   app:
     baseUrl: https://your-domain.com
   backend:
     baseUrl: https://your-domain.com
   ```

2. **Update ingress** in `kubernetes/backstage-deployment.yaml`:
   ```yaml
   spec:
     tls:
     - hosts:
       - your-domain.com
     rules:
     - host: your-domain.com
   ```

### 8. Deploy Backstage

```bash
kubectl apply -f kubernetes/backstage-deployment.yaml
```

### 9. Verify Deployment

```bash
# Check pod status
kubectl get pods -n backstage

# Check logs
kubectl logs -f deployment/backstage -n backstage

# Check services
kubectl get svc -n backstage

# Check ingress
kubectl get ingress -n backstage
```

### 10. Configure DNS

Point your domain (`backstage.cdcr.ca.gov`) to your ingress controller's external IP.

```bash
# Get ingress IP
kubectl get ingress backstage -n backstage
```

## Post-Deployment Configuration

### 1. Verify Kubernetes Integration

Once deployed, verify that Backstage can connect to all your clusters:
- Navigate to a component with Kubernetes annotations
- Check the "Kubernetes" tab
- Verify you can see resources from all 6 clusters

### 2. Configure GitHub Authentication for Production

**GitHub OAuth is the primary authentication method for the CDCR Development Portal.**

#### Production Setup Steps:

1. **User Management**: CDCR team members are automatically granted access through GitHub OAuth once they are added to the GitHub organization. User entities in `/catalog/cdcr-teams.yaml` are created automatically through the sign-in resolvers - no manual user creation required for each team member.

2. **Update GitHub OAuth app for production domain**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Update "Authorization callback URL": `https://backstage.cdcr.ca.gov/api/auth/github/handler/frame`
   - Ensure "Homepage URL": `https://backstage.cdcr.ca.gov`

3. **Update production secrets**:
   ```bash
   # Update Kubernetes secrets with production GitHub OAuth credentials
   kubectl create secret generic backstage-secrets \
     --from-literal=AUTH_GITHUB_CLIENT_ID=your-prod-client-id \
     --from-literal=AUTH_GITHUB_CLIENT_SECRET=your-prod-client-secret
   ```

#### Authentication Flow:
- Users sign in with their GitHub accounts
- Must be added to catalog as User entities to access the portal
- Automatic team membership based on catalog configuration

### 3. Test GitHub Integration

- Try creating a new service using the template
- Verify GitHub Actions appear in the CI/CD tab
- Test GitHub OAuth login with team member accounts

### 4. Install Additional Plugins for Enhanced Visibility

The CDCR Development Portal includes additional plugins for operational excellence:

#### Enhanced Operational Visibility
The CDCR Development Portal provides comprehensive operational visibility through integrated plugins:

**Core Plugins Included**:
- **GitHub Actions Integration**: View CI/CD workflows and build status
- **Flux GitOps Integration**: Monitor deployment pipelines and Git repositories  
- **Kubernetes Integration**: Multi-cluster resource monitoring and management
- **Service Catalog**: Centralized application and dependency tracking

**Advanced Plugin Ecosystem**:
For additional capabilities, the platform supports third-party plugins for:
- **CI/CD Statistics**: Build metrics and DORA performance tracking
- **Security Scanning**: Vulnerability management and SBOM generation
- **Log Aggregation**: Kubernetes log viewing and analysis
- **Topology Visualization**: Service dependency mapping

**Benefits for CDCR**:
- Unified view of applications across 6 Kubernetes clusters
- GitOps workflow visibility for secure deployments  
- GitHub OAuth integration for seamless authentication
- Extensible architecture for future operational needs

### 5. Configure Monitoring

Set up monitoring for:
- Pod health and resource usage
- Database performance
- Application logs
- External dependencies (GitHub, clusters)

### 6. Verify Plugin Functionality

After deployment, verify that all plugins are working correctly:

#### Kubernetes Integration
- Navigate to any component with Kubernetes annotations
- Check the "Kubernetes" tab shows resources from all 6 clusters
- Verify you can see pods, services, and deployments

#### GitOps (Flux) Integration  
- Visit the "GitOps" tab on service entities
- Verify Flux Git repositories are displayed
- Check Helm releases show deployment status

#### GitHub Actions Integration
- Open the "CI/CD" tab on service entities  
- Verify GitHub Actions workflows are displayed
- Check build status and pipeline execution history
- Test workflow triggering and status updates

#### GitHub Integration
- Test GitHub OAuth login with team member accounts
- Verify GitHub Actions appear in the CI/CD tab
- Try creating a new service using the scaffolder template

## Troubleshooting

### Common Issues

1. **Pod Won't Start**
   ```bash
   kubectl describe pod <pod-name> -n backstage
   kubectl logs <pod-name> -n backstage
   ```

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check secret values
   - Confirm network connectivity

3. **Kubernetes Integration Not Working**
   - Verify service account tokens are valid
   - Check cluster endpoints are accessible
   - Confirm RBAC permissions

4. **Ingress/SSL Issues**
   - Verify cert-manager is installed
   - Check DNS resolution
   - Confirm ingress controller is working

5. **Plugin Issues**
   
   **GitHub Actions Plugin Not Working**:
   - Verify entities have proper `github.com/project-slug` annotations
   - Check that GitHub Actions workflows are accessible and enabled
   - Test GitHub token permissions for repository access
   - Confirm GitHub integration is properly configured
   
   **Flux Plugin Not Showing Data**:
   - Verify Flux is properly installed on clusters
   - Check that entities have Flux annotations: `flux.weave.works/git-repository`
   - Confirm Kubernetes plugin can access Flux CRDs

### Health Checks

Backstage provides health check endpoints:
- `https://backstage.cdcr.ca.gov/healthcheck` - Overall health
- Check pod logs for startup issues

**Plugin-Specific Health Checks**:
- GitHub Actions: Verify GitHub API connectivity and workflow access
- Flux: Confirm Flux controllers are healthy across clusters  
- GitHub OAuth: Test authentication and API connectivity
- Kubernetes: Ensure cluster connectivity and resource access

## Security Considerations

1. **Secrets Management**
   - Use sealed-secrets or external secret management
   - Rotate service account tokens regularly
   - Limit RBAC permissions to minimum required

2. **Network Security**
   - Use network policies to restrict pod communication
   - Enable TLS for all external connections
   - Consider using a service mesh

3. **Access Control**
   - Configure proper GitHub OAuth scopes
   - Review team memberships and permissions
   - Monitor access logs

## Scaling and High Availability

For production deployment:

1. **Multiple Replicas**
   ```yaml
   spec:
     replicas: 3
   ```

2. **External Database**
   - Use managed PostgreSQL service
   - Configure connection pooling
   - Set up database backups

3. **Load Balancing**
   - Configure ingress for multiple pods
   - Use session affinity if needed

4. **Resource Limits**
   - Adjust CPU/memory based on usage
   - Monitor and tune performance

## Backup and Recovery

1. **Database Backups**
   - Regular PostgreSQL backups
   - Test restore procedures

2. **Configuration Backups**
   - Version control all YAML files
   - Backup secrets (encrypted)

3. **Disaster Recovery**
   - Document recovery procedures
   - Test in non-production environment