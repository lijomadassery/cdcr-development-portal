import React from 'react';
import { SignInPageProps, SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { 
  Container,
  Typography,
  Paper,
  makeStyles,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import CloudIcon from '@material-ui/icons/Cloud';
import SecurityIcon from '@material-ui/icons/Security';
import GitHubIcon from '@material-ui/icons/GitHub';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: theme.palette.type === 'dark' 
      ? `radial-gradient(circle at 50% 0%, ${theme.palette.primary.dark}22 0%, transparent 70%), #121212`
      : `radial-gradient(circle at 50% 0%, ${theme.palette.primary.light}22 0%, transparent 70%), #fafafa`,
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
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
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
  },
  signInContainer: {
    maxWidth: 400,
    margin: '0 auto',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    background: theme.palette.background.paper,
    boxShadow: theme.palette.type === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.palette.divider}`,
    // Minimal CSS to make it more compact
    '& .MuiCard-root': {
      background: 'transparent',
      boxShadow: 'none',
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(1),
    },
  },
  features: {
    marginTop: theme.spacing(4),
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(2),
    maxWidth: 600,
    margin: `${theme.spacing(4)}px auto 0`,
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
}));

export const StyledSignInPage = (props: SignInPageProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    { icon: DashboardIcon, title: 'Service Catalog', subtitle: '20+ Apps' },
    { icon: CloudIcon, title: 'Multi-Cloud', subtitle: '6 Clusters' },
    { icon: SecurityIcon, title: 'Secure', subtitle: 'OAuth 2.0' },
    { icon: GitHubIcon, title: 'GitOps', subtitle: 'Flux CD' },
  ];

  return (
    <div className={classes.wrapper}>
      <Container maxWidth="md">
        <div className={classes.header}>
          <Typography variant="h1" className={classes.title}>
            CDCR Development Portal
          </Typography>
          <Typography variant="h6" className={classes.subtitle}>
            Your gateway to unified application management
          </Typography>
        </div>

        <Fade in={true} timeout={600}>
          <Paper className={classes.signInContainer} elevation={0}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Typography variant="h5" gutterBottom style={{ fontWeight: 600 }}>
                Welcome
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sign in to access your development resources
              </Typography>
            </div>
            
            {/* This is the EXACT same working SignInPage component */}
            <SignInPage
              {...props}
              auto
              providers={[
                'guest',
                {
                  id: 'github-auth-provider',
                  title: 'GitHub',
                  message: 'Sign in using GitHub',
                  apiRef: githubAuthApiRef,
                },
              ]}
            />
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

        <div className={classes.footer}>
          <Typography variant="body2">
            © 2024 California Department of Corrections and Rehabilitation
          </Typography>
        </div>
      </Container>
    </div>
  );
};