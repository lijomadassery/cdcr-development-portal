# Kubernetes Deployment Structure

This directory contains all Kubernetes manifests for deploying the CDCR Development Portal.

## Directory Structure

```
kubernetes/
├── base/                           # Base configurations shared across environments
│   ├── namespace.yaml             # Namespace and ServiceAccount definitions
│   ├── backstage-rbac.yaml        # RBAC configurations
│   └── network-policy.yaml        # Network policies
│
├── environments/
│   ├── local/                     # Local/Minikube development environment
│   │   ├── backstage-deployment.yaml
│   │   ├── postgres.yaml
│   │   ├── ingress.yaml
│   │   ├── app-config-local.yaml  # ConfigMap with local overrides
│   │   ├── secrets.yaml.example   # Template for secrets (copy and fill)
│   │   └── kustomization.yaml
│   │
│   └── production/                # Production environment
│       ├── backstage-deployment.yaml
│       ├── postgres.yaml
│       ├── secrets.yaml.example   # Template for secrets (copy and fill)
│       └── kustomization.yaml
│
└── catalog/                       # Catalog data ConfigMaps (for local dev)
    ├── catalog-configmap.yaml     # CDCR teams and users
    ├── catalog-coast-configmap.yaml
    └── catalog-discharge-configmap.yaml
```

## Deployment Instructions

### Local Development (Minikube)

1. **Copy and configure secrets:**
   ```bash
   cp environments/local/secrets.yaml.example environments/local/secrets.yaml
   # Edit secrets.yaml with your actual values
   ```

2. **Deploy using kustomize:**
   ```bash
   kubectl apply -k environments/local/
   ```

   Or deploy manually:
   ```bash
   kubectl apply -f environments/local/secrets.yaml
   kubectl apply -f base/
   kubectl apply -f catalog/
   kubectl apply -f environments/local/
   ```

3. **Access Backstage:**
   ```bash
   kubectl port-forward -n backstage-local svc/backstage 7001:7000
   # Open http://localhost:7001
   ```

### Production Deployment

1. **Copy and configure secrets:**
   ```bash
   cp environments/production/secrets.yaml.example environments/production/secrets.yaml
   # Edit with production values
   ```

2. **Deploy using kustomize:**
   ```bash
   kubectl apply -k environments/production/
   ```

3. **Note:** In production, catalog data should be loaded from git repositories, not ConfigMaps.

## Important Notes

- **NEVER** commit actual `secrets.yaml` files to git
- Always use `secrets.yaml.example` as a template
- The `.gitignore` is configured to exclude `secrets.yaml` files
- Production catalog data should come from git repos, not ConfigMaps

## Updating Catalog Data

For local development, update the ConfigMaps in the `catalog/` directory.
For production, update the catalog files in your git repositories and Backstage will pull them automatically.