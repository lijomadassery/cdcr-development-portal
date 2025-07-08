# Kubernetes Plugin Setup Guide for CDCR Development Portal

## Overview
This guide documents the complete setup process for the Kubernetes plugin in Backstage, including troubleshooting steps for common issues encountered during deployment on Minikube.

## Prerequisites
- Minikube running locally
- kubectl configured to work with Minikube
- GitHub account with OAuth app configured
- Backstage application code ready for deployment

## 1. GitHub OAuth Configuration

### 1.1 Create GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with the following settings:
   - **Application name**: CDCR Development Portal
   - **Homepage URL**: `http://127.0.0.1:7001`
   - **Authorization callback URL**: `http://127.0.0.1:7001/api/auth/github/handler/frame`

### 1.2 Important Notes
- Use `127.0.0.1` instead of `localhost` to avoid DNS resolution issues
- The callback URL must include the full path: `/api/auth/github/handler/frame`
- Port 7001 is used to avoid conflicts with macOS Control Center (which uses port 7000)

## 2. Backstage Configuration

### 2.1 App Configuration (`app-config.yaml`)
```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${GITHUB_CLIENT_ID}
        clientSecret: ${GITHUB_CLIENT_SECRET}

kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: https://kubernetes.default.svc
          name: minikube
          serviceAccountToken: ${K8S_SERVICE_ACCOUNT_TOKEN}
          skipTLSVerify: true
          skipMetricsLookup: true
```

### 2.2 Environment Variables
Set these environment variables in your deployment:
```yaml
env:
  - name: GITHUB_CLIENT_ID
    value: "your-github-client-id"
  - name: GITHUB_CLIENT_SECRET
    value: "your-github-client-secret"
  - name: K8S_SERVICE_ACCOUNT_TOKEN
    valueFrom:
      secretKeyRef:
        name: backstage-secrets
        key: k8s-service-account-token
```

## 3. Kubernetes Deployment Configuration

### 3.1 Namespace Setup
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: backstage-local
```

### 3.2 Service Account and RBAC
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: backstage-sa
  namespace: backstage-local
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: backstage-cluster-role
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "configmaps", "secrets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["ingresses"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: backstage-cluster-role-binding
subjects:
  - kind: ServiceAccount
    name: backstage-sa
    namespace: backstage-local
roleRef:
  kind: ClusterRole
  name: backstage-cluster-role
  apiGroup: rbac.authorization.k8s.io
```

### 3.3 Backstage Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backstage
  namespace: backstage-local
  labels:
    backstage.io/kubernetes-id: cdcr-development-portal
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backstage
      backstage.io/kubernetes-id: cdcr-development-portal
  template:
    metadata:
      labels:
        app: backstage
        backstage.io/kubernetes-id: cdcr-development-portal
    spec:
      serviceAccountName: backstage-sa
      containers:
        - name: backstage
          image: your-backstage-image:latest
          ports:
            - containerPort: 7000
          env:
            - name: GITHUB_CLIENT_ID
              value: "your-github-client-id"
            - name: GITHUB_CLIENT_SECRET
              value: "your-github-client-secret"
            - name: K8S_SERVICE_ACCOUNT_TOKEN
              valueFrom:
                secretKeyRef:
                  name: backstage-secrets
                  key: k8s-service-account-token
```

### 3.4 Postgres Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: backstage-local
  labels:
    backstage.io/kubernetes-id: cdcr-development-portal
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
      backstage.io/kubernetes-id: cdcr-development-portal
  template:
    metadata:
      labels:
        app: postgres
        backstage.io/kubernetes-id: cdcr-development-portal
    spec:
      containers:
        - name: postgres
          image: postgres:13
          env:
            - name: POSTGRES_DB
              value: backstage_plugin_catalog
            - name: POSTGRES_USER
              value: postgres
            - name: POSTGRES_PASSWORD
              value: postgres
          ports:
            - containerPort: 5432
```

### 3.5 Services
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backstage
  namespace: backstage-local
  labels:
    backstage.io/kubernetes-id: cdcr-development-portal
spec:
  selector:
    app: backstage
    backstage.io/kubernetes-id: cdcr-development-portal
  ports:
    - protocol: TCP
      port: 7000
      targetPort: 7000
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: backstage-local
  labels:
    backstage.io/kubernetes-id: cdcr-development-portal
spec:
  selector:
    app: postgres
    backstage.io/kubernetes-id: cdcr-development-portal
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
```

## 4. Entity Catalog Configuration

### 4.1 Component Entity (`catalog-info.yaml`)
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: cdcr-development-portal
  description: CDCR Development Portal
  annotations:
    backstage.io/kubernetes-label-selector: 'backstage.io/kubernetes-id=cdcr-development-portal'
spec:
  type: website
  lifecycle: production
  owner: platform-team
```

## 5. Deployment Commands

### 5.1 Apply Kubernetes Resources
```bash
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Apply RBAC
kubectl apply -f kubernetes/backstage-rbac.yaml

# Apply secrets (create this file with your actual values)
kubectl apply -f kubernetes/backstage-secrets.yaml

# Apply deployments
kubectl apply -f kubernetes/environments/production/backstage-deployment.yaml
kubectl apply -f kubernetes/environments/production/postgres.yaml

# Apply services
kubectl apply -f kubernetes/backstage-service.yaml
kubectl apply -f kubernetes/postgres-service.yaml

# Apply catalog entity
kubectl apply -f catalog-info.yaml
```

### 5.2 Port Forwarding
```bash
# Forward Backstage service to local port 7001
kubectl port-forward svc/backstage 7001:7000 -n backstage-local
```

## 6. Troubleshooting Guide

### 6.1 Port Forwarding Issues
**Problem**: `error: timed out waiting for the condition`

**Solutions**:
1. Check if the service exists: `kubectl get svc -n backstage-local`
2. Verify pods are running: `kubectl get pods -n backstage-local`
3. Check service selectors match pod labels
4. Restart port forwarding after deployment changes

### 6.2 GitHub Authentication Issues
**Problem**: Login redirects fail or authentication errors

**Solutions**:
1. Verify OAuth app callback URL matches exactly: `http://127.0.0.1:7001/api/auth/github/handler/frame`
2. Ensure `environment: development` is set in auth config
3. Check client ID and secret are correct
4. Clear browser cache and cookies

### 6.3 Kubernetes Plugin Shows No Resources
**Problem**: Plugin displays "No Kubernetes resources found"

**Solutions**:
1. Verify service account token is mounted and valid
2. Check RBAC permissions are correct
3. Ensure all resources have the required label: `backstage.io/kubernetes-id=cdcr-development-portal`
4. Verify the label selector in catalog entity matches resource labels

### 6.4 Labels Not Persisting
**Problem**: Labels added to pods are lost after restart

**Solution**: Labels must be added to the deployment spec under:
- `spec.template.metadata.labels`
- `spec.selector.matchLabels`

**Note**: These fields are immutable and require recreating the deployment.

### 6.5 401 Unauthorized Errors
**Problem**: Kubernetes plugin returns 401 errors

**Solutions**:
1. Verify service account token is valid: `kubectl get secret -n backstage-local`
2. Check token is mounted in deployment
3. Verify RBAC permissions
4. Use internal cluster URL: `https://kubernetes.default.svc`

## 7. Verification Steps

### 7.1 Check Pod Status
```bash
kubectl get pods -n backstage-local
kubectl get pods -n backstage-local --show-labels
```

### 7.2 Verify Labels
```bash
# Check deployment labels
kubectl get deployments -n backstage-local --show-labels

# Check service labels
kubectl get services -n backstage-local --show-labels

# Check pod labels
kubectl get pods -n backstage-local --show-labels
```

### 7.3 Test API Access
```bash
# Test service account token
kubectl auth can-i list pods --as=system:serviceaccount:backstage-local:backstage-sa

# Test API access from within pod
kubectl exec -it <backstage-pod-name> -n backstage-local -- curl -k -H "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" https://kubernetes.default.svc/api/v1/namespaces/backstage-local/pods
```

### 7.4 Check Backstage Logs
```bash
kubectl logs -f deployment/backstage -n backstage-local
```

## 8. Common Commands Reference

```bash
# Restart deployments
kubectl rollout restart deployment/backstage -n backstage-local
kubectl rollout restart deployment/postgres -n backstage-local

# Check rollout status
kubectl rollout status deployment/backstage -n backstage-local

# Delete and recreate deployments (for label changes)
kubectl delete deployment backstage postgres -n backstage-local
kubectl apply -f kubernetes/environments/production/backstage-deployment.yaml
kubectl apply -f kubernetes/environments/production/postgres.yaml

# Check service account token
kubectl get secret backstage-secrets -n backstage-local -o yaml

# Port forwarding (restart after deployment changes)
kubectl port-forward svc/backstage 7001:7000 -n backstage-local
```

## 9. Important Notes

1. **Port Conflicts**: macOS Control Center uses port 7000, so we use port 7001
2. **Label Requirements**: All Kubernetes resources must have `backstage.io/kubernetes-id=cdcr-development-portal`
3. **Immutable Fields**: Deployment selectors and template labels cannot be patched - recreate the deployment
4. **Service Account**: Must be in the same namespace as the Backstage deployment
5. **Token Mounting**: Service account token must be mounted as environment variable
6. **Internal URLs**: Use `https://kubernetes.default.svc` for cluster communication

## 10. Handoff Checklist

Before handing off to platform engineers, ensure:

- [ ] GitHub OAuth app is configured correctly
- [ ] All Kubernetes resources have proper labels
- [ ] RBAC permissions are set up
- [ ] Service account token is mounted
- [ ] Port forwarding is working
- [ ] Backstage can authenticate with GitHub
- [ ] Kubernetes plugin shows resources
- [ ] All configuration files are committed to version control
- [ ] Documentation is complete and up-to-date

This guide should provide a complete reference for setting up and troubleshooting the Kubernetes plugin in Backstage. 