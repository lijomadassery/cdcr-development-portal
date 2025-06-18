import React from 'react';
import { 
  SignInPageProps,
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
} from '@backstage/core-components';
import { useApi, githubAuthApiRef, configApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { 
  Grid, 
  Button, 
  Typography, 
  Box,
  Card,
  CardContent,
  CardActions,
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import PersonIcon from '@material-ui/icons/Person';

export const CustomSignInPage = ({ onSignInSuccess }: SignInPageProps) => {
  const githubAuthApi = useApi(githubAuthApiRef);
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);

  const handleGitHubSignIn = async () => {
    try {
      console.log('Starting GitHub sign-in...');
      
      // Clear any existing session first
      try {
        await githubAuthApi.signOut();
        console.log('Cleared existing GitHub session');
      } catch (e) {
        console.log('No existing session to clear');
      }
      
      // Start fresh sign-in
      await githubAuthApi.signIn();
      console.log('GitHub sign-in successful');
      
      // Check if we have a valid session
      const session = await githubAuthApi.getAccessToken();
      console.log('GitHub session created:', !!session);
      console.log('Session details:', session ? 'Valid token received' : 'No token');
      
      console.log('Calling onSignInSuccess...');
      onSignInSuccess();
      console.log('onSignInSuccess called');
      
      // Force a page reload as a fallback
      setTimeout(() => {
        console.log('Forcing page reload after successful auth...');
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('GitHub sign-in failed:', error);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      console.log('Starting guest sign-in...');
      
      // Navigate directly to the main page - bypass auth for guest
      console.log('Redirecting to catalog page...');
      window.location.href = '/catalog';
      
    } catch (error) {
      console.error('Guest sign-in failed:', error);
    }
  };

  return (
    <Page themeId="home">
      <Header title="CDCR Development Portal" />
      <Content>
        <ContentHeader title="Sign in to your portal">
          <HeaderLabel label="Environment" value="Development" />
        </ContentHeader>
        
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <GitHubIcon style={{ marginRight: 8 }} />
                  <Typography variant="h6">
                    GitHub
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Sign in with your GitHub account to access the full portal with personalized features.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleGitHubSignIn}
                  startIcon={<GitHubIcon />}
                >
                  Sign in with GitHub
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon style={{ marginRight: 8 }} />
                  <Typography variant="h6">
                    Guest Access
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Continue as a guest with limited access to explore the portal.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleGuestSignIn}
                  startIcon={<PersonIcon />}
                >
                  Enter as Guest
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Box mt={4}>
          <InfoCard title="About CDCR Development Portal">
            <Typography variant="body1">
              Welcome to the California Department of Corrections and Rehabilitation 
              Development Portal. This platform provides developers with access to 
              service catalogs, documentation, and development tools.
            </Typography>
          </InfoCard>
        </Box>
      </Content>
    </Page>
  );
};