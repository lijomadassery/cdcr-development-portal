# CDCR Backstage Platform Handoff

## For Platform Engineer

This package contains everything needed to deploy the CDCR Backstage Developer Portal.

### 📦 What's Included

1. **deployment-secrets.zip** (Password Protected)
   - Contains GitHub OAuth credentials
   - Contains GitHub Personal Access Token
   - Template for Kubernetes service account tokens

2. **deployment-instructions.md**
   - Complete deployment guide
   - Security requirements
   - Step-by-step instructions

3. **Full Repository**
   - Docker image: `ghcr.io/lijomadassery/backstage:latest`
   - Kubernetes manifests in `/kubernetes` directory
   - Complete deployment guide in `/docs/deployment-guide.md`

### 🔐 Encrypted Archive Password
⚠️ **Password will be shared via separate secure channel**


### 📋 What You Need to Do

1. **Extract the encrypted archive** using the password provided via phone
2. **Review deployment-instructions.md** for complete setup
3. **Create Kubernetes service accounts** for 6 clusters (instructions included)
4. **Provision PostgreSQL database**
5. **Create Kubernetes secrets** with all credentials
6. **Deploy using manifests** in `/kubernetes` directory

### 🏗️ Infrastructure Requirements

- **6 Kubernetes clusters**: dev, test, stage, prod, sandbox, ss-prod
- **PostgreSQL database** (managed service recommended)
- **Domain**: backstage.cdcr.ca.gov
- **SSL certificates** (cert-manager recommended)
- **Ingress controller** (nginx recommended)

### 📞 Contact Information

**Developer**: Lijo Madassery
**GitHub Repository**: https://github.com/lijomadassery/cdcr-development-portal
**Container Registry**: ghcr.io/lijomadassery/backstage

### 🚀 Post-Deployment

After successful deployment:
1. Verify GitHub OAuth authentication
2. Test all 6 Kubernetes cluster connections
3. Confirm Flux GitOps integration
4. Validate GitHub Actions CI/CD visibility
5. Test catalog functionality

---

**Security Reminder**: All credentials in the encrypted archive are production-ready. Handle with appropriate security measures per CDCR policies.