import { useState } from 'react';
import { 
  Page,
  Progress,
} from '@backstage/core-components';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { 
  Button, 
  Typography, 
  makeStyles,
  Container,
  Paper,
  Fade,
  Grow,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import SecurityIcon from '@material-ui/icons/Security';
import CloudIcon from '@material-ui/icons/Cloud';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(3),
    background: theme.palette.type === 'dark' 
      ? `radial-gradient(circle at 50% 0%, ${theme.palette.primary.dark}22 0%, transparent 70%), #121212`
      : `radial-gradient(circle at 50% 0%, ${theme.palette.primary.light}22 0%, transparent 70%), #fafafa`,
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    animation: '$fadeInDown 0.6s ease-out',
  },
  '@keyframes fadeInDown': {
    from: {
      opacity: 0,
      transform: 'translateY(-20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  title: {
    fontWeight: 800,
    fontSize: '2.5rem',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    backgroundClip: 'text',
    textFillColor: 'transparent',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
  },
  loginCard: {
    maxWidth: 500,
    margin: '0 auto',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    background: theme.palette.background.paper,
    boxShadow: theme.palette.type === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.palette.divider}`,
    animation: '$fadeInUp 0.6s ease-out 0.2s both',
  },
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: theme.spacing(1),
  },
  button: {
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: theme.spacing(1),
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.5s ease',
    },
    '&:hover::before': {
      left: '100%',
    },
  },
  githubButton: {
    backgroundColor: '#24292e',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#1a1e22',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
  },
  guestButton: {
    marginTop: theme.spacing(2),
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    border: `2px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  },
  divider: {
    margin: theme.spacing(3, 0),
    display: 'flex',
    alignItems: 'center',
    '&::before, &::after': {
      content: '""',
      flex: 1,
      height: 1,
      background: theme.palette.divider,
    },
    '& span': {
      padding: theme.spacing(0, 2),
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
    },
  },
  features: {
    marginTop: theme.spacing(3),
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(2),
    maxWidth: 600,
    margin: '0 auto',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  featureCard: {
    padding: theme.spacing(2),
    textAlign: 'center',
    background: theme.palette.background.default,
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease',
    cursor: 'default',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: theme.palette.primary.main,
      boxShadow: theme.palette.type === 'dark'
        ? '0 4px 20px rgba(255, 255, 255, 0.1)'
        : '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
  },
  featureIcon: {
    fontSize: 40,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  featureTitle: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  featureSubtitle: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  footer: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  success: {
    color: theme.palette.success.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
  },
  signInWrapper: {
    marginTop: theme.spacing(1),
    '& .MuiButton-root': {
      padding: theme.spacing(1.5, 3),
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: theme.spacing(1),
      transition: 'all 0.2s ease-in-out',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: theme.spacing(0.5),
      width: '100%',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover::before': {
        left: '100%',
      },
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#24292e',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#1a1e22',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
    },
    '& .MuiButton-outlined': {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      border: `2px solid ${theme.palette.divider}`,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiCardContent-root': {
      padding: '0 !important',
      paddingBottom: '0 !important',
      '&:last-child': {
        paddingBottom: '0 !important',
      },
    },
    '& .MuiCard-root': {
      background: 'transparent !important',
      boxShadow: 'none !important',
      margin: 0,
      marginBottom: 0,
    },
    '& .MuiCardHeader-root': {
      display: 'none',
    },
    '& .MuiGrid-container': {
      margin: 0,
      width: '100%',
      marginBottom: '0 !important',
    },
    '& .MuiGrid-item': {
      padding: theme.spacing(0.25),
      paddingBottom: 0,
    },
  },
}));

export const ModernSignInPage = (props: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const githubAuthApi = useApi(githubAuthApiRef);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleProviderSignIn = async (providerId: string) => {
    setIsLoading(true);
    
    try {
      if (providerId === 'guest') {
        // Call the onSignInSuccess callback which Backstage provides
        props.onSignInSuccess?.();
      } else if (providerId === 'github-auth-provider') {
        // For GitHub, use the API directly
        await githubAuthApi.signIn();
        props.onSignInSuccess?.();
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      setIsLoading(false);
    }
  };

  const features = [
    { icon: DashboardIcon, title: 'Service Catalog', subtitle: '20+ Apps' },
    { icon: CloudIcon, title: 'Multi-Cloud', subtitle: '6 Clusters' },
    { icon: SecurityIcon, title: 'Secure', subtitle: 'OAuth 2.0' },
    { icon: GitHubIcon, title: 'GitOps', subtitle: 'Flux CD' },
  ];

  return (
    <Page themeId="home" className={classes.root}>
      <div className={classes.container}>
        <Container maxWidth="md">
          <div className={classes.logoSection}>
            <Typography variant="h1" className={classes.title}>
              CDCR Development Portal
            </Typography>
            <Typography variant="h6" className={classes.subtitle}>
              Your gateway to unified application management
            </Typography>
          </div>

          <Fade in={true} timeout={600}>
            <Paper className={classes.loginCard} elevation={0}>
              <div className={classes.welcomeText}>
                <Typography variant="h5" gutterBottom style={{ fontWeight: 600 }}>
                  Welcome
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Sign in to access your development resources
                </Typography>
              </div>

              {isLoading ? (
                <div className={classes.loading}>
                  <Progress />
                </div>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    className={`${classes.button} ${classes.githubButton}`}
                    onClick={() => handleProviderSignIn('github-auth-provider')}
                    startIcon={<GitHubIcon />}
                    disabled={isLoading}
                  >
                    Continue with GitHub
                  </Button>

                  <div className={classes.divider}>
                    <span>or</span>
                  </div>

                  <Button
                    fullWidth
                    variant="outlined"
                    className={`${classes.button} ${classes.guestButton}`}
                    onClick={() => handleProviderSignIn('guest')}
                    startIcon={<PersonIcon />}
                    disabled={isLoading}
                  >
                    Continue as Guest
                  </Button>
                </>
              )}
            </Paper>
          </Fade>

          {!isMobile && (
            <Fade in={true} timeout={800}>
              <div className={classes.features}>
                {features.map((feature, index) => (
                  <Grow
                    in={true}
                    timeout={1000 + index * 100}
                    key={feature.title}
                  >
                    <Paper className={classes.featureCard} elevation={0}>
                      <feature.icon className={classes.featureIcon} />
                      <Typography className={classes.featureTitle}>
                        {feature.title}
                      </Typography>
                      <Typography className={classes.featureSubtitle}>
                        {feature.subtitle}
                      </Typography>
                    </Paper>
                  </Grow>
                ))}
              </div>
            </Fade>
          )}
        </Container>

        <div className={classes.footer}>
          <Typography variant="body2">
            © 2024 California Department of Corrections and Rehabilitation
          </Typography>
        </div>
      </div>
    </Page>
  );
};