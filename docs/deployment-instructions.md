# CDCR Backstage Deployment - Credentials Handoff

## For Platform Engineer

This document contains instructions for securely obtaining and configuring the required credentials for the CDCR Backstage deployment.

### Required Credentials

#### 1. GitHub OAuth App Credentials (Developer Team Provides)
- **Client ID**: Request from developer team
- **Client Secret**: Request from developer team
- **Purpose**: User authentication via GitHub

#### 2. GitHub Personal Access Token (Developer Team Provides)
- **Token**: Request from developer team
- **Required Scopes**: `repo`, `read:org`, `read:user`
- **Purpose**: Reading repository data and organization structure

#### 3. Kubernetes Service Account Tokens (Platform Team Creates)
Create read-only service accounts for each cluster:

```bash
# For each cluster (dev, test, stage, prod, sandbox, ss-prod):
kubectl create serviceaccount backstage-readonly -n default
kubectl create clusterrolebinding backstage-readonly \
  --clusterrole=view \
  --serviceaccount=default:backstage-readonly

# Get the token
kubectl get secret $(kubectl get serviceaccount backstage-readonly -o jsonpath='{.secrets[0].name}') \
  -o jsonpath='{.data.token}' | base64 --decode
```

#### 4. PostgreSQL Database (Platform Team Provides)
- Create a PostgreSQL instance
- Database name: `backstage`
- Create user with full permissions on the database

### Secure Credential Transfer

#### Option 1: Use Your Organization's Secret Management
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Kubernetes Secrets

#### Option 2: Encrypted File Transfer
1. Developer team will provide `deployment-secrets.env` via secure channel
2. Use your organization's approved encrypted file transfer method

### Kubernetes Secret Creation

Once you have all credentials, create the Kubernetes secret:

```bash
kubectl create secret generic backstage-secrets \
  --from-literal=AUTH_GITHUB_CLIENT_ID=<value> \
  --from-literal=AUTH_GITHUB_CLIENT_SECRET=<value> \
  --from-literal=GITHUB_TOKEN=<value> \
  --from-literal=KUBERNETES_DEV_URL=<value> \
  --from-literal=KUBERNETES_DEV_SA_TOKEN=<value> \
  --from-literal=KUBERNETES_TEST_URL=<value> \
  --from-literal=KUBERNETES_TEST_SA_TOKEN=<value> \
  --from-literal=KUBERNETES_STAGE_URL=<value> \
  --from-literal=KUBERNETES_STAGE_SA_TOKEN=<value> \
  --from-literal=KUBERNETES_PROD_URL=<value> \
  --from-literal=KUBERNETES_PROD_SA_TOKEN=<value> \
  --from-literal=KUBERNETES_SANDBOX_URL=<value> \
  --from-literal=KUBERNETES_SANDBOX_SA_TOKEN=<value> \
  --from-literal=KUBERNETES_SS_PROD_URL=<value> \
  --from-literal=KUBERNETES_SS_PROD_SA_TOKEN=<value> \
  --from-literal=POSTGRES_HOST=<value> \
  --from-literal=POSTGRES_PORT=5432 \
  --from-literal=POSTGRES_USER=<value> \
  --from-literal=POSTGRES_PASSWORD=<value> \
  -n backstage-system
```

### Contact Information

**Developer Team Contact**: [Your contact info]
**Secure Credential Transfer Method**: [Specify your preferred method]

### Next Steps

1. Contact developer team for GitHub credentials
2. Create Kubernetes service accounts and tokens
3. Provision PostgreSQL database
4. Create Kubernetes secrets
5. Deploy using the provided manifests in `/kubernetes` directory

---

**Security Note**: Never commit credentials to Git. Always use secure transfer methods approved by your organization.