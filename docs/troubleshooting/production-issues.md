# Production Deployment Troubleshooting Guide

## Common Production Issues and Solutions

This guide covers the most common issues encountered during production deployment to ss-prod cluster and their solutions.

## Issue 1: Kubernetes Plugin Not Showing All Resources

### Symptoms
- Only seeing pods, services, deployments
- Missing ConfigMaps, Secrets, Ingresses
- Limited resource visibility compared to local development

### Root Cause
The `objectTypes` configuration was previously limiting which resources Backstage could fetch.

### Solution ✅ RESOLVED
This has been fixed in the latest version. The configuration now fetches all Kubernetes resources by default.

**Verification:**
```bash
# Check current configuration doesn't have objectTypes limitation
grep -A 10 "kubernetes:" app-config.yaml
# Should NOT see "objectTypes:" section
```

**If you still see limited resources:**
```bash
# Check if resources have proper labels
kubectl get configmaps,secrets,ingresses -n your-namespace --show-labels | grep backstage.io/kubernetes-id

# Label resources if missing
kubectl label configmap your-config backstage.io/kubernetes-id=your-component-name
kubectl label secret your-secret backstage.io/kubernetes-id=your-component-name
kubectl label ingress your-ingress backstage.io/kubernetes-id=your-component-name
```

## Issue 2: GitOps Plugin Not Displaying Data

### Symptoms
- GitOps tab appears but shows "No resources found"
- Flux components not visible
- Empty GitOps dashboard

### Root Cause Analysis
1. **Missing GitOps annotations** in entity configuration
2. **Flux not installed** in target clusters
3. **Flux resources missing labels** for Backstage discovery
4. **Insufficient RBAC permissions** for Flux CRDs

### Solution

**Step 1: Verify GitOps Annotations**
```yaml
# In your catalog-info.yaml or generated catalog files
metadata:
  annotations:
    # Required for GitOps plugin
    flux.weave.works/git-repository: your-component-name
    flux.weave.works/git-repository-namespace: your-namespace
```

**Step 2: Check Flux Installation**
```bash
# Verify Flux CRDs exist
kubectl get crd | grep toolkit.fluxcd.io

# If missing, install Flux
kubectl apply -f https://github.com/fluxcd/flux2/releases/latest/download/install.yaml
```

**Step 3: Label Flux Resources**
```bash
# Label existing Flux resources
kubectl label gitrepository your-repo backstage.io/kubernetes-id=your-component-name -n your-namespace
kubectl label helmrelease your-release backstage.io/kubernetes-id=your-component-name -n your-namespace
kubectl label kustomization your-kustomization backstage.io/kubernetes-id=your-component-name -n your-namespace
```

**Step 4: Verify RBAC Permissions**
```bash
# Check Flux CRD access
kubectl auth can-i get gitrepositories --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get helmreleases --as=system:serviceaccount:backstage:backstage
kubectl auth can-i get kustomizations --as=system:serviceaccount:backstage:backstage
```

## Issue 3: Component Import Scripts Failing

### Symptoms
- `node scripts/generate-catalog.js` fails
- Missing dependencies errors
- Generated files not appearing in Backstage

### Root Cause
- Missing Node.js dependencies
- Incorrect project configuration
- Files not being read by Backstage

### Solution

**Step 1: Install Dependencies**
```bash
# Install required dependencies
npm install js-yaml

# Verify Node.js version
node --version  # Should be 18+
```

**Step 2: Fix Configuration**
```javascript
// In scripts/generate-catalog.js
const CDCR_PROJECTS = {
  'your-system': {
    name: 'your-system',
    title: 'Your System Name',
    description: 'System description',
    owner: 'your-team',  // Must match team name in CDCR_TEAMS
    components: [
      {
        name: 'your-component',
        title: 'Your Component',
        type: 'service',  // service, frontend, website
        description: 'Component description',
        repo: 'your-org/your-repo',  // GitHub slug format
        kubernetes: {
          namespace: 'your-namespace',
          labelSelector: 'app=your-component'  // Valid label selector
        },
        tags: ['your', 'tags']
      }
    ]
  }
};
```

**Step 3: Verify Generated Files**
```bash
# Run generation script
node scripts/generate-catalog.js

# Check generated files
ls -la catalog/
cat catalog/your-system-system.yaml

# Verify app-config.yaml was updated
grep -A 5 "# CDCR Applications" app-config.yaml
```

**Step 4: Test File Loading**
```bash
# In production, check if Backstage can read files
kubectl logs -f deployment/backstage -n backstage | grep catalog

# Look for these log entries:
# - "Reading catalog-info.yaml files"
# - "Processing entities"
# - "Catalog refresh completed"
```

## Issue 4: Authentication Problems

### Symptoms
- Users can't sign in with GitHub
- "Failed to authenticate" errors
- Redirect loops during login

### Root Cause
- GitHub OAuth configuration mismatch
- Callback URL incorrect for production domain
- Missing user entities in catalog

### Solution

**Step 1: Verify GitHub OAuth App**
```bash
# Check production domain matches OAuth app settings
# GitHub OAuth App Settings:
# - Homepage URL: https://backstage.mt-dev.cdcr.ca.gov
# - Callback URL: https://backstage.mt-dev.cdcr.ca.gov/api/auth/github/handler/frame
```

**Step 2: Update Production Configuration**
```yaml
# In app-config.production.yaml
app:
  baseUrl: https://backstage.mt-dev.cdcr.ca.gov
backend:
  baseUrl: https://backstage.mt-dev.cdcr.ca.gov
  cors:
    origin: https://backstage.mt-dev.cdcr.ca.gov
```

**Step 3: Verify User Entities**
```bash
# Check if user entities exist
curl https://backstage.mt-dev.cdcr.ca.gov/api/catalog/entities?filter=kind=user

# If missing, ensure catalog generation includes users
node scripts/generate-catalog.js
```

**Step 4: Test Authentication Flow**
```bash
# Test OAuth flow
curl -I https://backstage.mt-dev.cdcr.ca.gov/api/auth/github

# Check backend logs for auth errors
kubectl logs -f deployment/backstage -n backstage | grep auth
```

## Issue 5: Database Connection Failures

### Symptoms
- Pods crashing with database errors
- "Connection refused" errors in logs
- Slow application startup

### Root Cause
- Database credentials incorrect
- Network connectivity issues
- Database not accepting connections
- Connection pool exhaustion

### Solution

**Step 1: Verify Database Credentials**
```bash
# Check secrets are correctly set
kubectl get secret backstage-secrets -n backstage -o yaml

# Test database connection manually
kubectl exec -it deployment/backstage -n backstage -- bash
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d backstage_plugin_catalog
```

**Step 2: Check Network Connectivity**
```bash
# Test connectivity from pod to database
kubectl exec -it deployment/backstage -n backstage -- bash
nc -zv $POSTGRES_HOST $POSTGRES_PORT
```

**Step 3: Verify Database Configuration**
```sql
-- Connect as database admin
SELECT * FROM pg_stat_activity WHERE datname = 'backstage_plugin_catalog';

-- Check connection limits
SHOW max_connections;
SHOW shared_preload_libraries;
```

**Step 4: Optimize Connection Pool**
```yaml
# In app-config.production.yaml
backend:
  database:
    client: pg
    connection:
      host: ${POSTGRES_HOST}
      port: ${POSTGRES_PORT}
      user: ${POSTGRES_USER}
      password: ${POSTGRES_PASSWORD}
      database: backstage_plugin_catalog
      # Add connection pool settings
      pool:
        min: 2
        max: 10
        idleTimeoutMillis: 30000
        createTimeoutMillis: 30000
        acquireTimeoutMillis: 30000
```

## Issue 6: Ingress and SSL Problems

### Symptoms
- HTTPS not working
- Certificate errors
- 502/503 errors from ingress

### Root Cause
- Cert-manager not properly configured
- DNS not pointing to correct IP
- Ingress controller issues

### Solution

**Step 1: Check Ingress Status**
```bash
# Verify ingress is created and has external IP
kubectl get ingress backstage -n backstage
kubectl describe ingress backstage -n backstage

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

**Step 2: Verify SSL Certificate**
```bash
# Check certificate status
kubectl get certificate -n backstage
kubectl describe certificate backstage -n backstage

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

**Step 3: Test DNS Resolution**
```bash
# Verify DNS points to correct IP
nslookup backstage.mt-dev.cdcr.ca.gov
dig backstage.mt-dev.cdcr.ca.gov

# Should resolve to ingress external IP
kubectl get ingress backstage -n backstage -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

**Step 4: Test SSL Certificate**
```bash
# Test HTTPS connectivity
curl -I https://backstage.mt-dev.cdcr.ca.gov

# Check certificate details
openssl s_client -connect backstage.mt-dev.cdcr.ca.gov:443 -servername backstage.mt-dev.cdcr.ca.gov
```

## Issue 7: Pod Logs Plugin Not Working

### Symptoms
- Pod Logs tab shows no data
- "Failed to fetch logs" errors
- Empty log viewer

### Root Cause
- Custom logs plugin configuration issues
- Missing RBAC permissions for log access
- Pods not properly labeled

### Solution

**Step 1: Verify Pod Labels**
```bash
# Check if pods have required labels
kubectl get pods -n your-namespace --show-labels | grep backstage.io/kubernetes-id

# Label pods if missing
kubectl label pod your-pod backstage.io/kubernetes-id=your-component-name -n your-namespace
```

**Step 2: Check RBAC for Logs**
```bash
# Verify log access permissions
kubectl auth can-i get pods/log --as=system:serviceaccount:backstage:backstage
kubectl auth can-i list pods --as=system:serviceaccount:backstage:backstage
```

**Step 3: Test Log Access**
```bash
# Test manual log retrieval
kubectl logs your-pod -n your-namespace

# From within Backstage pod
kubectl exec -it deployment/backstage -n backstage -- bash
kubectl --token=$KUBERNETES_YOUR_CLUSTER_SA_TOKEN --server=$KUBERNETES_YOUR_CLUSTER_URL logs your-pod -n your-namespace
```

## Diagnostic Commands

### Quick Health Check
```bash
# Overall cluster health
kubectl get pods -n backstage
kubectl get services -n backstage
kubectl get ingress -n backstage

# Application health
curl https://backstage.mt-dev.cdcr.ca.gov/healthcheck

# Database connectivity
kubectl exec -it deployment/backstage -n backstage -- bash -c "pg_isready -h \$POSTGRES_HOST -p \$POSTGRES_PORT"
```

### Log Analysis
```bash
# Application logs
kubectl logs -f deployment/backstage -n backstage

# Filter for specific issues
kubectl logs deployment/backstage -n backstage | grep -i error
kubectl logs deployment/backstage -n backstage | grep -i auth
kubectl logs deployment/backstage -n backstage | grep -i database
kubectl logs deployment/backstage -n backstage | grep -i kubernetes
```

### Performance Monitoring
```bash
# Resource usage
kubectl top pods -n backstage
kubectl describe pod -n backstage

# Database performance
kubectl exec -it deployment/backstage -n backstage -- bash
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d backstage_plugin_catalog -c "SELECT * FROM pg_stat_activity;"
```

## Escalation Procedures

### When to Escalate
- Database corruption or data loss
- Security-related authentication bypass
- Complete service outage lasting >30 minutes
- Suspected security breach or unauthorized access

### Information to Gather
1. **Timeline**: When did the issue start?
2. **Scope**: What functionality is affected?
3. **Logs**: Recent application and infrastructure logs
4. **Changes**: Any recent deployments or configuration changes
5. **Environment**: Cluster status, resource usage, external dependencies

### Emergency Contacts
- **Platform Team**: For infrastructure and cluster issues
- **Security Team**: For authentication or security concerns
- **Database Team**: For PostgreSQL-related problems
- **Network Team**: For connectivity and DNS issues

### Recovery Procedures
1. **Immediate**: Roll back to last known good deployment
2. **Short-term**: Implement temporary workarounds
3. **Long-term**: Root cause analysis and permanent fixes

## Prevention

### Monitoring Setup
```bash
# Set up alerts for:
# - Pod restarts
# - High memory/CPU usage
# - Database connection failures
# - Certificate expiration
# - Authentication failures
```

### Regular Maintenance
- **Daily**: Check application logs and performance
- **Weekly**: Verify all plugins are functioning
- **Monthly**: Update container images and review security
- **Quarterly**: Rotate credentials and review configurations

### Testing
- **Pre-deployment**: Test in staging environment
- **Post-deployment**: Run smoke tests on all functionality
- **Regular**: Automated health checks and integration tests