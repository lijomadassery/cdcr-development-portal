# Deployment Logs Feature - Implementation Guide

## Overview

This document describes the implementation and deployment of the **Deployment Logs Feature** for the CDCR Development Portal. This feature allows users to view logs from all pods in a deployment simultaneously through a tabbed interface.

## 🎯 Feature Description

The Deployment Logs feature provides:
- **Tabbed interface** for viewing logs from multiple pods in a deployment
- **Color-coded tabs** with status indicators for each pod
- **Concurrent log fetching** from multiple pods
- **Search functionality** across all logs
- **Download all logs** to a single file
- **Real-time streaming** with follow mode
- **Error handling** per individual pod

## 📂 Files Created/Modified

### New Components Created

1. **`plugins/kubernetes-logs/src/components/DeploymentLogsModal/DeploymentLogsModal.tsx`**
   - Main modal component with tabbed interface
   - Handles multiple pod log display
   - Includes search, follow, timestamps controls
   - Download functionality for all logs

2. **`plugins/kubernetes-logs/src/components/DeploymentLogsModal/index.ts`**
   - Export file for DeploymentLogsModal component

3. **`plugins/kubernetes-logs/src/hooks/useDeploymentLogs.ts`**
   - Custom hook for fetching logs from multiple pods concurrently
   - Manages individual pod states (loading, errors, data)
   - Supports both streaming and static log fetching
   - Cleanup and abort controller management

### Modified Components

1. **`packages/app/src/components/kubernetes/KubernetesContentWithLogs.tsx`**
   - Added deployment grouping logic
   - Groups pods by ReplicaSet ownership to identify deployments
   - Added "View All Logs (X)" buttons for multi-pod deployments
   - Integrated DeploymentLogsModal component

2. **`packages/app/src/components/catalog/EntityPage.tsx`**
   - Added "Pod Logs" tab to entity routing
   - Registered KubernetesContentWithLogs component

3. **`plugins/kubernetes-logs/src/components/index.ts`**
   - Added DeploymentLogsModal export

4. **`plugins/kubernetes-logs/src/hooks/index.ts`**
   - Added useDeploymentLogs export

## 🔧 Technical Implementation

### Pod Grouping Logic

The system groups pods by deployment using ReplicaSet owner references:

```typescript
// Groups pods by their owner (ReplicaSet/Deployment pattern)
const podGroupings = React.useMemo(() => {
  const groupings = {};
  
  Object.entries(podsByCluster).forEach(([clusterName, pods]) => {
    pods.forEach(pod => {
      let groupName = 'standalone';
      const ownerRefs = pod.metadata?.ownerReferences;
      
      if (ownerRefs && ownerRefs.length > 0) {
        const owner = ownerRefs[0];
        if (owner.kind === 'ReplicaSet' && owner.name) {
          // Extract deployment name from ReplicaSet name
          const parts = owner.name.split('-');
          if (parts.length >= 2) {
            groupName = parts.slice(0, -1).join('-');
          }
        }
      }
      
      groupings[clusterName][groupName] = {
        name: groupName,
        kind: 'Deployment', 
        pods: [...pods]
      };
    });
  });
  
  return groupings;
}, [podsByCluster]);
```

### Log Fetching Strategy

Uses the `useDeploymentLogs` hook which:
1. **Concurrent fetching**: Fetches logs from all pods simultaneously
2. **Individual state management**: Each pod has its own loading/error/data state
3. **Streaming support**: Uses EventSource for real-time log streaming
4. **Cleanup**: Proper abort controller and EventSource cleanup

## 🚀 Deployment Process

### Build Process

The feature was built and deployed using the established minikube workflow:

```bash
# 1. Set minikube docker environment
eval $(minikube docker-env)

# 2. Pull and tag GitHub-built image
docker pull ghcr.io/lijomadassery/backstage:latest
docker tag ghcr.io/lijomadassery/backstage:latest backstage:github-latest

# 3. Update deployment configuration
# Edit kubernetes/environments/local/backstage-deployment.yaml
# Set image: backstage:github-latest

# 4. Apply and restart deployment
kubectl apply -f kubernetes/environments/local/backstage-deployment.yaml
kubectl rollout restart deployment/backstage -n backstage-local
```

### Image Management

- **GitHub Actions**: Builds official images and pushes to `ghcr.io/lijomadassery/backstage:latest`
- **Local Development**: Uses `eval $(minikube docker-env)` to build/deploy locally
- **Production**: Deployment uses `imagePullPolicy: Never` for local minikube images

## 🔍 Testing & Troubleshooting

### Critical Discovery: Feature Visibility Requirements

**⚠️ IMPORTANT**: The deployment logs feature only appears when there are **multiple pods in a deployment**.

#### Why Feature Wasn't Initially Visible

1. **Single Pod Deployments**: Components with only 1 pod don't show the feature
2. **Grouping Logic**: Feature only renders "View All Logs" buttons for deployments with `> 1` pod
3. **Expected Behavior**: This is intentional - no need for deployment logs if there's only one pod

#### Testing Requirements

To test the feature, you need:

```bash
# Scale deployment to multiple replicas
kubectl scale deployment backstage --replicas=2 -n backstage-local

# Verify multiple pods are running
kubectl get pods -n backstage-local
```

### Debugging Steps Used

1. **Browser Console Verification**:
   ```javascript
   // Check for debug logs in browser console
   // Look for: "🔍 KubernetesContentWithLogs mounted"
   ```

2. **JavaScript Bundle Verification**:
   ```bash
   # Verify feature code is in bundle
   curl -s "http://127.0.0.1:7001/static/main.*.js" | grep -c "View All Logs"
   ```

3. **Pod Image Verification**:
   ```bash
   # Check running image
   kubectl describe pod -l app=backstage -n backstage-local | grep Image:
   ```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|--------|----------|
| Feature not visible | Single pod deployment | Scale to multiple replicas |
| Wrong image version | Docker cache/tag issues | Use `eval $(minikube docker-env)` before build |
| Browser cache | Old JavaScript cached | Hard refresh (`Ctrl+Shift+R`) |
| Missing dependencies | Build process incomplete | Ensure `yarn build:all` completes successfully |

## 📍 Where to Find the Feature

1. **Navigate to any component** with Kubernetes resources
2. **Click "Pod Logs" tab** (separate from "Kubernetes" tab)
3. **Look for "Applications (Grouped Pods)" section**
4. **Find "View All Logs (X)" buttons** for deployments with multiple pods

## 🎛️ Feature Configuration

### Component Props

```typescript
interface DeploymentLogsModalProps {
  open: boolean;
  onClose: () => void;
  deploymentName: string;
  namespace: string;
  pods: PodInfo[];
  clusterName: string;
  maxPods?: number; // Default: 10
}
```

### Hook Options

```typescript
interface UseDeploymentLogsOptions {
  pods: PodInfo[];
  namespace: string;
  clusterName: string;
  follow?: boolean;        // Default: false
  timestamps?: boolean;    // Default: true
  tailLines?: number;      // Default: 1000
}
```

## 🔗 Integration Points

### Kubernetes Plugin Integration

The feature integrates with:
- **`@backstage/plugin-kubernetes`**: For cluster/pod data
- **`useKubernetesObjects`**: Hook for fetching Kubernetes resources
- **`kubernetesApiRef`**: API for log fetching via proxy

### Entity Annotation Requirements

Components must have the annotation:
```yaml
metadata:
  annotations:
    backstage.io/kubernetes-id: <component-name>
```

## 📊 Performance Considerations

- **Concurrent Requests**: Fetches logs from all pods simultaneously
- **Memory Usage**: Large log volumes may impact browser performance
- **Network Usage**: Multiple EventSource connections for streaming
- **Cleanup**: Automatic cleanup of connections on component unmount

## 🔄 Future Enhancements

Potential improvements:
1. **Log Aggregation**: Merge logs from all pods in chronological order
2. **Filtering**: Filter logs by severity level or keywords
3. **Export Formats**: Support for JSON, CSV export formats
4. **Persistence**: Save log queries and filters
5. **Real-time Metrics**: Pod resource usage alongside logs

## 📋 Commit History

- **Initial Implementation**: Created all new components and hooks
- **Integration**: Added to EntityPage routing and component exports
- **Deployment Configuration**: Updated local deployment to use GitHub-built images
- **Documentation**: This comprehensive guide for future reference

## ⏱️ Time Investment

**Total Time Spent**: ~4 hours
- **Initial Development**: 2 hours
- **Build/Deployment Issues**: 1.5 hours  
- **Debugging & Testing**: 30 minutes

**Key Lesson**: Always test with multiple pod deployments to verify multi-pod features!