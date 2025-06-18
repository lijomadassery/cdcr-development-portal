# Kubernetes Setup for CDCR Development Portal

## Overview
This document describes how to configure Kubernetes cluster access for Backstage.

## Prerequisites
- Access to your 6 Kubernetes clusters (dev, test, stage, prod, sandbox, ss-prod)
- Service accounts created in each cluster with appropriate permissions
- kubectl configured to access your clusters

## Creating Service Accounts

For each cluster, you'll need to create a service account with read permissions. Here's an example:

```bash
# Create service account
kubectl create serviceaccount backstage-viewer -n default

# Create cluster role binding
kubectl create clusterrolebinding backstage-viewer \
  --clusterrole=view \
  --serviceaccount=default:backstage-viewer

# Get the service account token
kubectl get secret $(kubectl get sa backstage-viewer -n default -o jsonpath='{.secrets[0].name}') \
  -n default -o jsonpath='{.data.token}' | base64 -d

# Get the CA certificate
kubectl get secret $(kubectl get sa backstage-viewer -n default -o jsonpath='{.secrets[0].name}') \
  -n default -o jsonpath='{.data.ca\.crt}'
```

## Environment Variables

Add these to your `.env` file for each cluster:

```bash
# Dev Cluster
KUBERNETES_DEV_URL=https://your-dev-cluster-api-endpoint
KUBERNETES_DEV_SA_TOKEN=your-dev-service-account-token
KUBERNETES_DEV_CA_DATA=your-dev-ca-certificate-base64

# Test Cluster
KUBERNETES_TEST_URL=https://your-test-cluster-api-endpoint
KUBERNETES_TEST_SA_TOKEN=your-test-service-account-token
KUBERNETES_TEST_CA_DATA=your-test-ca-certificate-base64

# Stage Cluster
KUBERNETES_STAGE_URL=https://your-stage-cluster-api-endpoint
KUBERNETES_STAGE_SA_TOKEN=your-stage-service-account-token
KUBERNETES_STAGE_CA_DATA=your-stage-ca-certificate-base64

# Prod Cluster
KUBERNETES_PROD_URL=https://your-prod-cluster-api-endpoint
KUBERNETES_PROD_SA_TOKEN=your-prod-service-account-token
KUBERNETES_PROD_CA_DATA=your-prod-ca-certificate-base64

# Sandbox Cluster
KUBERNETES_SANDBOX_URL=https://your-sandbox-cluster-api-endpoint
KUBERNETES_SANDBOX_SA_TOKEN=your-sandbox-service-account-token
KUBERNETES_SANDBOX_CA_DATA=your-sandbox-ca-certificate-base64

# SS-Prod Cluster
KUBERNETES_SS_PROD_URL=https://your-ss-prod-cluster-api-endpoint
KUBERNETES_SS_PROD_SA_TOKEN=your-ss-prod-service-account-token
KUBERNETES_SS_PROD_CA_DATA=your-ss-prod-ca-certificate-base64
```

## Catalog Annotations

To enable Kubernetes monitoring for your components, add these annotations to your catalog entities:

```yaml
metadata:
  annotations:
    # Required: Kubernetes ID for the component
    backstage.io/kubernetes-id: my-service
    
    # Optional: Specific namespace (defaults to searching all namespaces)
    backstage.io/kubernetes-namespace: my-namespace
    
    # Optional: Label selector for more specific filtering
    backstage.io/kubernetes-label-selector: 'app=my-service,version=v1'
```

## Testing

1. Restart your Backstage server after adding the environment variables
2. Navigate to a component with Kubernetes annotations
3. Click on the "Kubernetes" tab
4. You should see pods, deployments, and other resources from all configured clusters

## Troubleshooting

- If you see "No Kubernetes resources found", check:
  - The component has the correct Kubernetes annotations
  - The service account has permissions to read resources
  - The namespace/labels match actual deployed resources
  
- Check the Backstage backend logs for any authentication errors