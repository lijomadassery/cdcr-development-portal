# GitHub OAuth App Setup for CDCR Development Portal

## Create GitHub OAuth App

1. Go to your GitHub organization settings
2. Navigate to: Settings → Developer settings → OAuth Apps → New OAuth App
3. Fill in the application details:
   - **Application name**: CDCR Development Portal
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:7007/api/auth/github/handler/frame`
4. Click "Register application"
5. Save the **Client ID** and generate a new **Client Secret**

## Configure Environment Variables

Create a `.env` file in the root of cdcr-portal:

```bash
# GitHub OAuth
export AUTH_GITHUB_CLIENT_ID=your_client_id_here
export AUTH_GITHUB_CLIENT_SECRET=your_client_secret_here

# GitHub Personal Access Token (for catalog integration)
export GITHUB_TOKEN=your_github_pat_here
```

## For Production

When deploying to production, update the URLs:
- Homepage URL: `https://backstage.cdcr.ca.gov`
- Authorization callback URL: `https://backstage.cdcr.ca.gov/api/auth/github/handler/frame`

## Enable GitHub Sign-in

The auth configuration has been added to `app-config.yaml`. To test:

1. Source the environment variables: `source .env`
2. Start Backstage: `yarn start`
3. Navigate to http://localhost:3000
4. You should see a "Sign in with GitHub" option