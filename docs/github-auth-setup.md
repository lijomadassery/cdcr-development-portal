# GitHub Authentication Setup

This guide walks through setting up GitHub OAuth authentication for the CDCR Development Portal.

## Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings**
   - Navigate to https://github.com/settings/applications/new
   - Or: GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

2. **Fill in OAuth App Details**
   ```
   Application name: CDCR Development Portal
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/github/handler/frame
   ```

3. **Create the Application**
   - Click "Register application"
   - Copy the **Client ID** and **Client Secret**

## Step 2: Create GitHub Personal Access Token

1. **Go to Token Settings**
   - Navigate to https://github.com/settings/tokens/new
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Configure Token**
   ```
   Note: CDCR Development Portal API
   Expiration: Custom (1 year recommended)
   ```

3. **Select Required Scopes**
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows  
   - ✅ `user:email` - Access user email addresses
   - ✅ `read:user` - Read user profile data
   - ✅ `read:org` - Read organization membership

4. **Generate Token**
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)

## Step 3: Configure Local Environment

1. **Copy Environment Template**
   ```bash
   cp .env.local.template .env.local
   ```

2. **Edit Environment File**
   ```bash
   # Open in your editor
   vim .env.local
   ```

3. **Add Your Credentials**
   ```bash
   # GitHub OAuth App credentials
   AUTH_GITHUB_CLIENT_ID=your_actual_client_id_here
   AUTH_GITHUB_CLIENT_SECRET=your_actual_client_secret_here

   # GitHub Personal Access Token
   GITHUB_TOKEN=your_actual_token_here
   ```

4. **Enable GitHub Auth in Configuration**
   
   After setting up your credentials, uncomment the GitHub auth section in `app-config.yaml`:
   ```yaml
   auth:
     providers:
       guest: {}
       github:  # Uncomment this entire section
         development:
           clientId: ${AUTH_GITHUB_CLIENT_ID}
           clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
   ```

5. **Update SignInPage Configuration**
   
   Edit `packages/app/src/App.tsx` to include GitHub provider:
   ```typescript
   components: {
     SignInPage: props => <SignInPage {...props} providers={['guest', 'github']} />,
   },
   ```

## Step 4: Test Authentication

1. **Start the Development Server**
   ```bash
   yarn dev
   ```

2. **Test Login**
   - Go to http://localhost:3000
   - You should see both "Guest" and "GitHub" login options
   - Click "GitHub" to test OAuth flow

3. **Verify GitHub Integration**
   - After logging in, navigate to a component page
   - Check the "CI/CD" tab for GitHub Actions
   - Verify GitHub repository links work

## Step 5: Production Configuration

For production deployment, add these same values to your Kubernetes secrets:

```bash
# In kubernetes/backstage-secrets.yaml
AUTH_GITHUB_CLIENT_ID: <base64-encoded-client-id>
AUTH_GITHUB_CLIENT_SECRET: <base64-encoded-client-secret>  
GITHUB_TOKEN: <base64-encoded-token>
```

Update the OAuth app callback URL for production:
```
Production callback URL: https://backstage.cdcr.ca.gov/api/auth/github/handler/frame
```

## Troubleshooting

### OAuth App Issues

**Error: "redirect_uri_mismatch"**
- Verify callback URL matches exactly: `http://localhost:3000/api/auth/github/handler/frame`
- Check for trailing slashes or typos

**Error: "invalid_client"**
- Verify Client ID and Client Secret are correct
- Check environment variables are loaded

### Token Issues

**Error: "Bad credentials"**
- Verify Personal Access Token is correct
- Check token hasn't expired
- Verify required scopes are selected

**Error: "Not Found" for repositories**
- Check token has `repo` scope
- Verify organization membership if accessing org repos

### Environment Issues

**Environment variables not loading**
```bash
# Verify .env.local exists and has correct format
cat .env.local

# Restart development server
yarn dev
```

**Still using guest authentication**
- Check App.tsx has both providers: `['guest', 'github']`
- Verify no syntax errors in configuration

## Security Notes

1. **Keep Credentials Secure**
   - Never commit `.env.local` to git
   - Use separate tokens for dev/prod
   - Rotate tokens regularly

2. **Scope Principle**
   - Only grant minimum required scopes
   - Review token permissions periodically

3. **Organization Access**
   - For CDCR org repositories, ensure proper team membership
   - Consider using organization-owned OAuth apps for production

## Additional Configuration

### Custom GitHub Enterprise

If using GitHub Enterprise, update `app-config.yaml`:

```yaml
integrations:
  github:
    - host: github.company.com
      apiBaseUrl: https://github.company.com/api/v3
      token: ${GITHUB_TOKEN}

auth:
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        enterpriseInstanceUrl: https://github.company.com
```

### Organization Restrictions

To restrict login to CDCR organization members:

```yaml
auth:
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
        organizations: ['CDCR-organization-name']
```