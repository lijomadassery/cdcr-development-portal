import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  makeStyles,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  Chip,
  Tooltip,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import RefreshIcon from '@material-ui/icons/Refresh';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { LogsViewer } from '../LogsViewer';
import { useDeploymentLogs } from '../../hooks/useDeploymentLogs';

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    margin: 0,
    padding: theme.spacing(2),
    paddingRight: theme.spacing(6),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  content: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
    minHeight: 500,
  },
  controls: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
  },
  tab: {
    minHeight: 48,
    textTransform: 'none',
  },
  tabLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  logsContainer: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  },
  podStatusIcon: {
    fontSize: 12,
  },
  maxPodsWarning: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
}));

const POD_COLORS = [
  '#1E88E5', // Blue
  '#43A047', // Green  
  '#E53935', // Red
  '#FB8C00', // Orange
  '#8E24AA', // Purple
  '#00ACC1', // Cyan
  '#F06292', // Pink
  '#66BB6A', // Light Green
  '#FFA726', // Light Orange
  '#AB47BC', // Light Purple
];

const getPodStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'running':
      return { color: '#4CAF50', tooltip: 'Running' };
    case 'pending':
      return { color: '#FF9800', tooltip: 'Pending' };
    case 'succeeded':
      return { color: '#2196F3', tooltip: 'Succeeded' };
    case 'failed':
      return { color: '#F44336', tooltip: 'Failed' };
    default:
      return { color: '#9E9E9E', tooltip: 'Unknown' };
  }
};

export interface PodInfo {
  name: string;
  namespace: string;
  status?: string;
  containerName?: string;
}

export interface DeploymentLogsModalProps {
  open: boolean;
  onClose: () => void;
  deploymentName: string;
  namespace: string;
  pods: PodInfo[];
  clusterName: string;
  maxPods?: number;
}

export const DeploymentLogsModal = ({
  open,
  onClose,
  deploymentName,
  namespace,
  pods,
  clusterName,
  maxPods = 10,
}: DeploymentLogsModalProps) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [follow, setFollow] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  // Limit pods to maxPods
  const displayPods = useMemo(() => 
    pods.slice(0, maxPods),
    [pods, maxPods]
  );

  // Assign colors to pods
  const podColors = useMemo(() => {
    const colors: Record<string, string> = {};
    displayPods.forEach((pod, index) => {
      colors[pod.name] = POD_COLORS[index % POD_COLORS.length];
    });
    return colors;
  }, [displayPods]);

  const { 
    logsData, 
    loading, 
    errors, 
    refetchAll,
    refetchPod 
  } = useDeploymentLogs({
    pods: displayPods,
    namespace,
    clusterName,
    follow,
    timestamps: showTimestamps,
  });

  const handleTabChange = useCallback((_: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleDownloadAll = useCallback(() => {
    const allLogs = displayPods.map(pod => {
      const logs = logsData[pod.name] || '';
      return `${'='.repeat(80)}\nPOD: ${pod.name}\nSTATUS: ${pod.status || 'Unknown'}\n${'='.repeat(80)}\n\n${logs}\n\n`;
    }).join('\n');

    const blob = new Blob([allLogs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deploymentName}-all-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [displayPods, logsData, deploymentName]);

  const activePod = displayPods[activeTab];
  const activePodLogs = activePod ? logsData[activePod.name] : '';
  const activePodColor = activePod ? podColors[activePod.name] : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="deployment-logs-dialog-title"
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6">
          Deployment Logs: {deploymentName}
        </Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.content}>
        {pods.length > maxPods && (
          <Box className={classes.maxPodsWarning}>
            <Typography variant="body2">
              Showing {maxPods} of {pods.length} pods. Increase maxPods to see more.
            </Typography>
          </Box>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className={classes.tabsContainer}
          variant="scrollable"
          scrollButtons="auto"
        >
          {displayPods.map((pod, index) => {
            const statusInfo = getPodStatusIcon(pod.status || '');
            return (
              <Tab
                key={pod.name}
                className={classes.tab}
                label={
                  <Box className={classes.tabLabel}>
                    <Tooltip title={statusInfo.tooltip}>
                      <FiberManualRecordIcon 
                        className={classes.podStatusIcon}
                        style={{ color: statusInfo.color }}
                      />
                    </Tooltip>
                    <Typography 
                      variant="body2"
                      style={{ color: podColors[pod.name] }}
                    >
                      {pod.name}
                    </Typography>
                    {errors[pod.name] && (
                      <Chip size="small" label="Error" color="error" />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        <Box className={classes.controls}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={follow}
                onChange={e => setFollow(e.target.checked)}
                color="primary"
              />
            }
            label="Follow"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showTimestamps}
                onChange={e => setShowTimestamps(e.target.checked)}
                color="primary"
              />
            }
            label="Timestamps"
          />
          
          <IconButton 
            onClick={() => activePod && refetchPod(activePod.name)} 
            disabled={loading[activePod?.name || '']}
          >
            <RefreshIcon />
          </IconButton>
          
          <IconButton onClick={handleDownloadAll} disabled={!Object.keys(logsData).length}>
            <GetAppIcon />
          </IconButton>
        </Box>

        <Box className={classes.logsContainer}>
          {activePod && loading[activePod.name] && !activePodLogs && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
          
          {activePod && errors[activePod.name] && (
            <Box p={2}>
              <Typography color="error">
                Error loading logs: {errors[activePod.name]}
              </Typography>
            </Box>
          )}
          
          {activePodLogs && (
            <Box style={{ color: activePodColor }}>
              <LogsViewer 
                logs={activePodLogs} 
                searchTerm={searchTerm}
                follow={follow}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={refetchAll} disabled={Object.values(loading).some(l => l)}>
          Refresh All
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};