import React from 'react';
import { 
  useKubernetesObjects,
  KubernetesObjects,
  GroupedResponses,
  EntityKubernetesContent,
} from '@backstage/plugin-kubernetes';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
  Chip,
  Box,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { 
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusError,
  StatusAborted,
} from '@backstage/core-components';
import { LogsButton } from '@internal/plugin-kubernetes-logs';

// Type definitions for Kubernetes objects
interface V1ObjectMeta {
  name?: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

interface V1Container {
  name: string;
  image?: string;
}

interface V1PodSpec {
  containers?: V1Container[];
}

interface V1PodStatus {
  phase?: string;
  conditions?: any[];
}

interface V1Pod {
  metadata?: V1ObjectMeta;
  spec?: V1PodSpec;
  status?: V1PodStatus;
}

const useStyles = makeStyles(theme => ({
  accordion: {
    marginTop: theme.spacing(2),
  },
  logsCell: {
    width: 100,
    textAlign: 'center',
  },
  containerChip: {
    margin: theme.spacing(0.5),
  },
  statusCell: {
    width: 120,
  },
}));

const getPodStatus = (pod: V1Pod): React.ReactElement => {
  const phase = pod.status?.phase || 'Unknown';
  
  switch (phase.toLowerCase()) {
    case 'running':
      return <StatusRunning />;
    case 'succeeded':
      return <StatusOK />;
    case 'pending':
      return <StatusPending />;
    case 'failed':
      return <StatusError />;
    case 'unknown':
    default:
      return <StatusAborted />;
  }
};

interface PodLogsTableProps {
  pods: V1Pod[];
  clusterName: string;
}

const PodLogsTable = ({ pods, clusterName }: PodLogsTableProps) => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Pod Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell className={classes.statusCell}>Status</TableCell>
            <TableCell>Containers</TableCell>
            <TableCell className={classes.logsCell}>Logs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pods.map((pod) => (
            <TableRow key={`${pod.metadata?.namespace}-${pod.metadata?.name}`}>
              <TableCell>{pod.metadata?.name || 'Unknown'}</TableCell>
              <TableCell>{pod.metadata?.namespace || 'default'}</TableCell>
              <TableCell>{getPodStatus(pod)}</TableCell>
              <TableCell>
                {pod.spec?.containers?.map((container: V1Container) => (
                  <Chip
                    key={container.name}
                    label={container.name}
                    size="small"
                    className={classes.containerChip}
                  />
                ))}
              </TableCell>
              <TableCell className={classes.logsCell}>
                <LogsButton
                  podName={pod.metadata?.name || ''}
                  namespace={pod.metadata?.namespace || 'default'}
                  clusterName={clusterName}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const KubernetesContentWithLogs = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);

  // Extract pods from the Kubernetes objects
  const getPodsByCluster = (): Record<string, V1Pod[]> => {
    const podsByCluster: Record<string, V1Pod[]> = {};

    if (!kubernetesObjects) return podsByCluster;

    kubernetesObjects.items.forEach((item: GroupedResponses) => {
      const clusterName = item.cluster.name;
      
      if (!podsByCluster[clusterName]) {
        podsByCluster[clusterName] = [];
      }

      // Look for pods in the resources
      item.resources.forEach((resource) => {
        if (resource.type === 'pods') {
          const pods = resource.resources as V1Pod[];
          podsByCluster[clusterName].push(...pods);
        }
      });
    });

    return podsByCluster;
  };

  const podsByCluster = getPodsByCluster();
  const hasPods = Object.keys(podsByCluster).some(
    cluster => podsByCluster[cluster].length > 0
  );

  return (
    <>
      {/* Original Kubernetes content */}
      <EntityKubernetesContent />
      
      {/* Add logs section if there are pods */}
      {!loading && !error && hasPods && (
        <Accordion className={classes.accordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Pod Logs</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} direction="column">
              {Object.entries(podsByCluster).map(([clusterName, pods]) => {
                if (pods.length === 0) return null;
                
                return (
                  <Grid item key={clusterName}>
                    <Typography variant="subtitle1" gutterBottom>
                      Cluster: {clusterName}
                    </Typography>
                    <PodLogsTable pods={pods} clusterName={clusterName} />
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};