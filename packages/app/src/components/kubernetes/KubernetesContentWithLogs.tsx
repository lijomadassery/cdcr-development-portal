import React from 'react';
import { 
  useKubernetesObjects,
} from '@backstage/plugin-kubernetes';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Grid,
  Typography,
  Chip,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Portal,
  Button,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import { 
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusError,
  StatusAborted,
} from '@backstage/core-components';
import { LogsModal, DeploymentLogsModal } from '@internal/plugin-kubernetes-logs';

// Type definitions for Kubernetes objects
interface V1OwnerReference {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller?: boolean;
  blockOwnerDeletion?: boolean;
}

interface V1ObjectMeta {
  name?: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  ownerReferences?: V1OwnerReference[];
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



const useStyles = makeStyles(() => ({
  contentWrapper: {
    position: 'relative',
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
  onLogClick: (pod: { podName: string; namespace: string; containerName?: string; clusterName: string }) => void;
}

const PodLogsTable = ({ pods, clusterName, onLogClick }: PodLogsTableProps) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Pod Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell style={{ width: 120 }}>Status</TableCell>
            <TableCell>Containers</TableCell>
            <TableCell style={{ width: 100, textAlign: 'center' }}>Logs</TableCell>
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
                    style={{ margin: '2px' }}
                  />
                ))}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                <IconButton
                  size="small"
                  onClick={() => onLogClick({
                    podName: pod.metadata?.name || '',
                    namespace: pod.metadata?.namespace || 'default',
                    clusterName
                  })}
                  data-testid="logs-button"
                >
                  <DescriptionIcon fontSize="small" />
                </IconButton>
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
  
  // Memoize entity to prevent useKubernetesObjects from re-running constantly
  const memoizedEntity = React.useMemo(() => entity, [entity.metadata?.uid, entity.metadata?.name]);
  const { kubernetesObjects, loading, error } = useKubernetesObjects(memoizedEntity);
  
  // Simple modal state with stable references
  const [modalData, setModalData] = React.useState<{
    open: boolean;
    podName: string;
    namespace: string;
    containerName?: string;
    clusterName: string;
  } | null>(null);

  // Deployment logs modal state
  const [deploymentModalData, setDeploymentModalData] = React.useState<{
    open: boolean;
    deploymentName: string;
    namespace: string;
    pods: Array<{
      name: string;
      namespace: string;
      status?: string;
    }>;
    clusterName: string;
  } | null>(null);

  // Handler for log button clicks - use stable reference
  const handleLogClick = React.useCallback((pod: {
    podName: string;
    namespace: string;
    containerName?: string;
    clusterName: string;
  }) => {
    console.log('🔍 Opening logs for pod:', pod);
    setModalData({
      open: true,
      podName: pod.podName,
      namespace: pod.namespace,
      containerName: pod.containerName,
      clusterName: pod.clusterName
    });
  }, []);

  // Handler for closing the modal - use stable reference
  const handleCloseModal = React.useCallback(() => {
    console.log('🔍 Closing logs modal');
    setModalData(null);
  }, []);

  // Handler for deployment logs
  const handleDeploymentLogsClick = React.useCallback((deployment: {
    deploymentName: string;
    namespace: string;
    pods: Array<{ name: string; namespace: string; status?: string }>;
    clusterName: string;
  }) => {
    console.log('🔍 Opening deployment logs for:', deployment);
    setDeploymentModalData({
      open: true,
      ...deployment
    });
  }, []);

  // Handler for closing deployment modal
  const handleCloseDeploymentModal = React.useCallback(() => {
    console.log('🔍 Closing deployment logs modal');
    setDeploymentModalData(null);
  }, []);

  // Memoize expensive computation to prevent re-calculation on every render
  const { podsByCluster } = React.useMemo(() => {
    const pods: Record<string, V1Pod[]> = {};

    if (!kubernetesObjects) return { podsByCluster: pods };

    kubernetesObjects.items.forEach((item: any) => {
      const clusterName = item.cluster.name;
      
      if (!pods[clusterName]) {
        pods[clusterName] = [];
      }

      // Look for pods in the resources
      console.log('🔍 All resource types in cluster', clusterName, ':', 
        item.resources.map((r: any) => r.type).join(', '));
      
      item.resources.forEach((resource: any) => {
        if (resource.type === 'pods') {
          const podList = resource.resources as V1Pod[];
          pods[clusterName].push(...podList);
        }
      });
    });

    return { podsByCluster: pods };
  }, [kubernetesObjects]);

  // Group pods by their owner (ReplicaSet/Deployment pattern)
  const podGroupings = React.useMemo(() => {
    const groupings: Record<string, Record<string, { name: string; kind: string; pods: V1Pod[] }>> = {};
    
    Object.entries(podsByCluster).forEach(([clusterName, pods]) => {
      groupings[clusterName] = {};
      
      // Group pods by their owner reference or app label
      const tempGroups: Record<string, V1Pod[]> = {};
      
      pods.forEach(pod => {
        let groupKey = 'standalone';
        
        // Check if pod has owner references (managed by ReplicaSet/Deployment)
        const ownerRefs = pod.metadata?.ownerReferences;
        if (ownerRefs && ownerRefs.length > 0) {
          // For ReplicaSet owners, extract the deployment name (before the hash)
          const owner = ownerRefs[0];
          if (owner.kind === 'ReplicaSet' && owner.name) {
            // ReplicaSet names are typically: deployment-name-hash
            const parts = owner.name.split('-');
            if (parts.length >= 2) {
              // Remove the last part (hash) to get deployment name
              groupKey = parts.slice(0, -1).join('-');
            }
          } else {
            groupKey = owner.name || 'unknown';
          }
        } else {
          // Fallback to app label for standalone pods
          groupKey = pod.metadata?.labels?.['app'] || 
                    pod.metadata?.labels?.['app.kubernetes.io/name'] || 
                    'standalone';
        }
        
        if (!tempGroups[groupKey]) {
          tempGroups[groupKey] = [];
        }
        tempGroups[groupKey].push(pod);
      });
      
      // Convert to final structure
      Object.entries(tempGroups).forEach(([key, pods]) => {
        groupings[clusterName][key] = {
          name: key,
          kind: 'Deployment', // We assume it's a deployment for now
          pods: pods
        };
      });
    });
    
    return groupings;
  }, [podsByCluster]);

  const hasPods = React.useMemo(() => 
    Object.keys(podsByCluster).some(cluster => podsByCluster[cluster].length > 0),
    [podsByCluster]
  );

  // Debug logging - only log when modal state changes to reduce render noise
  React.useEffect(() => {
    console.log('🔍 KubernetesContentWithLogs mounted, version: deployment-logs-v3');
    if (modalData) {
      console.log('🔍 [v2] Modal opened for:', modalData);
    }
  }, [modalData]);

  const errorMessage = typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error';

  return (
    <div className={classes.contentWrapper}>
      {/* Custom logs interface - primary content */}
      {loading ? (
        <Typography>Loading Kubernetes resources...</Typography>
      ) : error ? (
        <Typography color="error">Error loading Kubernetes resources: {errorMessage}</Typography>
      ) : (
        <Grid container spacing={2} direction="column">
          <Grid item>
            <Typography variant="h5" gutterBottom>
              Kubernetes Pod Logs
            </Typography>
          </Grid>
          
          {/* Show pod groupings (apps) */}
          {hasPods && Object.keys(podGroupings).some(cluster => 
            Object.keys(podGroupings[cluster]).some(group => 
              podGroupings[cluster][group].pods.length > 1
            )
          ) && (
            <>
              <Grid item>
                <Typography variant="h6" gutterBottom>
                  Applications (Grouped Pods)
                </Typography>
              </Grid>
              {Object.entries(podGroupings).map(([clusterName, groups]) => {
                // Only show groups with more than 1 pod
                const multiPodGroups = Object.entries(groups).filter(([_, group]) => group.pods.length > 1);
                if (multiPodGroups.length === 0) return null;
                
                return (
                  <Grid item key={`groups-${clusterName}`}>
                    <Typography variant="subtitle1" gutterBottom>
                      Cluster: {clusterName}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Application</TableCell>
                            <TableCell>Namespace</TableCell>
                            <TableCell>Pod Count</TableCell>
                            <TableCell>Pods</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {multiPodGroups.map(([groupKey, group]) => {
                            const namespace = group.pods[0]?.metadata?.namespace || 'default';
                            
                            return (
                              <TableRow key={`${clusterName}-${groupKey}`}>
                                <TableCell>{group.name}</TableCell>
                                <TableCell>{namespace}</TableCell>
                                <TableCell>{group.pods.length}</TableCell>
                                <TableCell>
                                  <Box display="flex" flexDirection="column" style={{ gap: '8px' }}>
                                    {group.pods.map((pod) => (
                                      <Box key={pod.metadata?.name} display="flex" alignItems="center" style={{ gap: '8px' }}>
                                        {getPodStatus(pod)}
                                        <Typography variant="body2">{pod.metadata?.name}</Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleLogClick({
                                            podName: pod.metadata?.name || '',
                                            namespace: pod.metadata?.namespace || 'default',
                                            clusterName
                                          })}
                                        >
                                          <DescriptionIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleDeploymentLogsClick({
                                      deploymentName: group.name,
                                      namespace,
                                      pods: group.pods.map(pod => ({
                                        name: pod.metadata?.name || '',
                                        namespace: pod.metadata?.namespace || 'default',
                                        status: pod.status?.phase
                                      })),
                                      clusterName
                                    })}
                                  >
                                    View All Logs ({group.pods.length})
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                );
              })}
            </>
          )}
          
          {/* Show individual pods section */}
          {hasPods && (
            <>
              <Grid item>
                <Typography variant="h6" gutterBottom>
                  Individual Pods
                </Typography>
              </Grid>
              {Object.entries(podsByCluster).map(([clusterName, pods]) => {
                if (pods.length === 0) return null;
                
                return (
                  <Grid item key={clusterName}>
                    <Typography variant="subtitle1" gutterBottom>
                      Cluster: {clusterName}
                    </Typography>
                    <PodLogsTable 
                      pods={pods} 
                      clusterName={clusterName} 
                      onLogClick={handleLogClick}
                    />
                  </Grid>
                );
              })}
            </>
          )}
          
          {!hasPods && (
            <Grid item>
              <Typography variant="body1" color="textSecondary">
                🔍 No pods found with matching Kubernetes labels for this entity.
                <br />
                Make sure your component has the appropriate backstage.io/kubernetes-id annotation.
                <br />
                Debug info: {JSON.stringify({ hasPods, podCount: Object.keys(podsByCluster).length })}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Logs Modal - Always rendered in Portal to prevent unmounting */}
      <Portal>
        {modalData && (
          <LogsModal
            key="kubernetes-logs-modal"
            open={modalData.open}
            onClose={handleCloseModal}
            podName={modalData.podName}
            namespace={modalData.namespace}
            containerName={modalData.containerName}
            clusterName={modalData.clusterName}
          />
        )}
        {deploymentModalData && (
          <DeploymentLogsModal
            key="deployment-logs-modal"
            open={deploymentModalData.open}
            onClose={handleCloseDeploymentModal}
            deploymentName={deploymentModalData.deploymentName}
            namespace={deploymentModalData.namespace}
            pods={deploymentModalData.pods}
            clusterName={deploymentModalData.clusterName}
            maxPods={10}
          />
        )}
      </Portal>
    </div>
  );
};