import { useState } from 'react';
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
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import RefreshIcon from '@material-ui/icons/Refresh';
import { LogsViewer } from '../LogsViewer';
import { usePodLogs } from '../../hooks';

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
  logsContainer: {
    flex: 1,
    overflow: 'auto',
  },
}));

export interface LogsModalProps {
  open: boolean;
  onClose: () => void;
  podName: string;
  namespace: string;
  containerName?: string;
  clusterName: string;
}

export const LogsModal = ({
  open,
  onClose,
  podName,
  namespace,
  containerName,
  clusterName,
}: LogsModalProps) => {
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [follow, setFollow] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  
  console.log('🔍 LogsModal props:', {
    open,
    podName,
    namespace,
    containerName,
    clusterName,
  });
  
  const { logs, loading, error, refetch } = usePodLogs({
    podName,
    namespace,
    containerName,
    clusterName,
    follow,
    timestamps: showTimestamps,
  });

  console.log('🔍 LogsModal state:', {
    logs: logs ? `${logs.length} bytes` : 'empty',
    loading,
    error: error?.message,
    follow,
    showTimestamps,
  });

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podName}-${containerName || 'all'}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="logs-dialog-title"
      key={`${podName}-${namespace}-${clusterName}`}
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6">
          Pod Logs: {podName}
          {containerName && ` / ${containerName}`}
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
          
          <IconButton onClick={refetch} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          
          <IconButton onClick={handleDownload} disabled={!logs || loading}>
            <GetAppIcon />
          </IconButton>
        </Box>

        <Box className={classes.logsContainer}>
          {loading && !logs && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Box p={2}>
              <Typography color="error">
                Error loading logs: {error.message}
              </Typography>
            </Box>
          )}
          
          {logs && (
            <LogsViewer 
              logs={logs} 
              searchTerm={searchTerm}
              follow={follow}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};