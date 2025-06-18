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

### 2. Use Pre-Built Docker Image

The Docker image is automatically built via GitHub Actions and available at:
```
ghcr.io/lijomadassery/backstage:latest
```

Update the image reference in `kubernetes/backstage-deployment.yaml`:
```yaml
image: ghcr.io/lijomadassery/backstage:latest
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

**Option A: Deploy New PostgreSQL Instance (Recommended)**
```bash
kubectl apply -f kubernetes/postgres.yaml
```

**Option B: Use Managed Database (Production)**
- AWS RDS, Google Cloud SQL, or Azure Database
- Point POSTGRES_HOST to managed service endpoint

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

### 7. Update Domain Configuration

Edit the following files with your actual domain:
- `app-config.production.yaml` - Update `baseUrl` values
- `kubernetes/backstage-deployment.yaml` - Update ingress host

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

### 2. Test GitHub Integration

- Try creating a new service using the template
- Verify GitHub Actions appear in the CI/CD tab
- Test GitHub OAuth login

### 3. Configure Monitoring

Set up monitoring for:
- Pod health and resource usage
- Database performance
- Application logs
- External dependencies (GitHub, clusters)

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

### Health Checks

Backstage provides health check endpoints:
- `https://backstage.cdcr.ca.gov/healthcheck` - Overall health
- Check pod logs for startup issues

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