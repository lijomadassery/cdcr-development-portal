# Manual Deployment Steps for Enhanced Logs Viewer

## Prerequisites
- Minikube is running
- GitHub Actions build has completed successfully

## Step-by-Step Deployment

### 1. Configure Docker Environment
```bash
# Use minikube's Docker daemon
eval $(minikube docker-env)
```

### 2. Pull Latest Image from GitHub Container Registry
```bash
# Pull the latest build
docker pull ghcr.io/lijomadassery/backstage:latest

# Verify image was pulled
docker images | grep backstage
```

### 3. Tag Image for Local Use
```bash
# Tag with a descriptive name
docker tag ghcr.io/lijomadassery/backstage:latest backstage:logs-enhanced
```

### 4. Update Kubernetes Deployment
```bash
# Update the deployment to use new image
kubectl set image deployment/backstage backstage=backstage:logs-enhanced -n backstage-local

# Monitor the rollout
kubectl rollout status deployment/backstage -n backstage-local
```

### 5. Verify Deployment
```bash
# Check pod status
kubectl get pods -n backstage-local

# Check logs for any errors
kubectl logs -f deployment/backstage -n backstage-local
```

### 6. Set Up Port Forwarding
```bash
# Kill any existing port forwards
pkill -f "kubectl port-forward.*7001:7000.*backstage-local" || true

# Start port forwarding
kubectl port-forward service/backstage 7001:7000 -n backstage-local &
```

### 7. Test the Application
1. Open browser to http://127.0.0.1:7001
2. Sign in with GitHub
3. Navigate to a component with Kubernetes resources
4. Click on "Pod Logs" tab
5. Test the new features:
   - Resizable dialog (drag corners)
   - Color-coded logs
   - Word wrap toggle
   - Horizontal scrolling when word wrap is off

## Troubleshooting

### If pods are crashing:
```bash
kubectl describe pod -n backstage-local
kubectl logs -p deployment/backstage -n backstage-local
```

### If port forwarding fails:
```bash
# Check what's using port 7001
lsof -i :7001

# Use a different port if needed
kubectl port-forward service/backstage 7002:7000 -n backstage-local &
```

### If image pull fails:
```bash
# Check if you're logged in to ghcr.io
docker login ghcr.io

# Or build locally if needed
docker build -t backstage:logs-enhanced .
```

## Rollback if Needed
```bash
# Rollback to previous version
kubectl rollout undo deployment/backstage -n backstage-local

# Or set specific image
kubectl set image deployment/backstage backstage=backstage:gitops-enabled -n backstage-local
```