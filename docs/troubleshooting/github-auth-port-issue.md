# GitHub Auth Port Redirect Issue - Resolution

## Problem Description

When deploying Backstage in Minikube with GitHub authentication, the login redirect was going to port 3000 instead of the expected port 7000. This caused authentication failures because:

1. GitHub OAuth callback URL was configured for port 7000
2. Backstage app configuration was set to use port 3000
3. This mismatch prevented successful authentication flow

## Root Cause

The issue was in the Minikube deployment configuration files:

1. **backstage-deployment.yaml (local)**: Environment variables were set to port 3000
2. **app-config-local.yaml**: Base URLs were set to port 7007
3. **Missing Service Configuration**: No proper service configuration for Minikube deployment
4. **Ingress Configuration**: Ingress was pointing to wrong port

## Solution Applied

### 1. Updated Minikube Deployment Configuration

**File**: `kubernetes/environments/local/backstage-deployment.yaml`

Changed environment variables:
```yaml
# Before
- name: APP_CONFIG_app_baseUrl
  value: "http://localhost:3000"
- name: APP_CONFIG_backend_baseUrl  
  value: "http://localhost:3000"

# After
- name: APP_CONFIG_app_baseUrl
  value: "http://localhost:7000"
- name: APP_CONFIG_backend_baseUrl  
  value: "http://localhost:7000"
```

### 2. Added Service Configuration

**File**: `kubernetes/environments/local/backstage-deployment.yaml`

Added service configuration:
```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: backstage
  namespace: backstage-local
spec:
  selector:
    app: backstage
  ports:
  - name: http
    port: 7000
    targetPort: 7007
```

### 3. Updated Ingress Configuration

**File**: `kubernetes/environments/local/ingress.yaml`

Changed service port:
```yaml
# Before
port:
  number: 7007

# After
port:
  number: 7000
```

### 4. Updated App Configuration

**File**: `kubernetes/environments/local/app-config-local.yaml`

Changed base URLs:
```yaml
# Before
app:
  baseUrl: http://localhost:7007
backend:
  baseUrl: http://localhost:7007
  cors:
    origin: http://localhost:7007

# After
app:
  baseUrl: http://localhost:7000
backend:
  baseUrl: http://localhost:7000
  cors:
    origin: http://localhost:7000
```

## Deployment Steps

1. **Update GitHub OAuth App**: Ensure your GitHub OAuth app callback URL is set to `http://localhost:7000/api/auth/github/handler/frame`

2. **Apply Updated Configurations**:
   ```bash
   kubectl apply -f kubernetes/environments/local/backstage-deployment.yaml
   kubectl apply -f kubernetes/environments/local/ingress.yaml
   kubectl apply -f kubernetes/environments/local/app-config-local.yaml
   ```

3. **Restart the Deployment**:
   ```bash
   kubectl rollout restart deployment/backstage -n backstage-local
   ```

4. **Verify Configuration**:
   ```bash
   kubectl get pods -n backstage-local
   kubectl logs -f deployment/backstage -n backstage-local
   ```

## Port Configuration Summary

| Component | Port | Purpose |
|-----------|------|---------|
| Container | 7007 | Internal Backstage application port |
| Service | 7000 | External service port |
| Ingress | 7000 | External access port |
| GitHub OAuth | 7000 | Callback URL port |

## Verification

After applying the changes:

1. Access Backstage at `http://localhost:7000`
2. Click "Sign In" → "GitHub"
3. Complete GitHub OAuth flow
4. Should redirect back to `http://localhost:7000` successfully

## Notes

- The container still runs on port 7007 internally
- The service exposes port 7000 externally
- All external communication (including OAuth callbacks) use port 7000
- This configuration is specific to Minikube local development
- Production deployment uses different configuration in `backstage-deployment.yaml` 