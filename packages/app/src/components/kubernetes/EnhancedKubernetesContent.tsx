import React from 'react';
import { Paper, Tab, Tabs, Box, Typography } from '@material-ui/core';
import { EntityKubernetesContent } from '@backstage/plugin-kubernetes';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { LogsButton } from '@internal/plugin-kubernetes-logs';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    position: 'relative',
  },
  logsSection: {
    marginTop: theme.spacing(2),
  },
  podItem: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podInfo: {
    flex: 1,
  },
  containerChip: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kubernetes-tabpanel-${index}`}
      aria-labelledby={`kubernetes-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export const EnhancedKubernetesContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  // This is a placeholder for demonstration
  // In a real implementation, you would get this data from the Kubernetes API
  const mockPodData = [
    {
      name: 'example-pod-1',
      namespace: 'default',
      cluster: 'production',
      containers: ['app', 'sidecar'],
      status: 'Running',
    },
    {
      name: 'example-pod-2',
      namespace: 'default', 
      cluster: 'production',
      containers: ['app'],
      status: 'Running',
    },
  ];

  return (
    <div className={classes.contentWrapper}>
      <InfoCard title="Kubernetes">
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="kubernetes tabs">
          <Tab label="Overview" />
          <Tab label="Logs" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {/* Original Kubernetes content */}
          <EntityKubernetesContent />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {/* Logs view */}
          <Box className={classes.logsSection}>
            <Typography variant="h6" gutterBottom>
              Pod Logs
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              View logs for pods associated with {entity.metadata.name}
            </Typography>
            
            {mockPodData.map((pod) => (
              <Paper key={pod.name} className={classes.podItem}>
                <div className={classes.podInfo}>
                  <Typography variant="subtitle1">{pod.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Namespace: {pod.namespace} | Cluster: {pod.cluster}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Containers: {pod.containers.join(', ')}
                  </Typography>
                </div>
                <LogsButton
                  podName={pod.name}
                  namespace={pod.namespace}
                  clusterName={pod.cluster}
                />
              </Paper>
            ))}
            
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
              Note: This is a demonstration. Real pod data will be fetched from your Kubernetes clusters.
            </Typography>
          </Box>
        </TabPanel>
      </InfoCard>
    </div>
  );
};