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
  Paper,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import RefreshIcon from '@material-ui/icons/Refresh';
import WrapTextIcon from '@material-ui/icons/WrapText';
import { LogsViewer } from '../LogsViewer';
import { usePodLogs } from '../../hooks';

const useStyles = makeStyles(theme => ({
  dialogPaper: {
    height: '85vh',
    maxHeight: '90vh',
    width: '85vw',
    maxWidth: '1400px',
    resize: 'both',
    overflow: 'auto',
  },
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
    height: 'calc(100% - 64px)', // Account for title and actions
  },
  controls: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logsContainer: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
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
  const [wordWrap, setWordWrap] = useState(true);
  
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
      maxWidth={false}
      fullWidth
      aria-labelledby="logs-dialog-title"
      key={`${podName}-${namespace}-${clusterName}`}
      PaperProps={{
        className: classes.dialogPaper,
      }}
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
          
          <FormControlLabel
            control={
              <Switch
                checked={wordWrap}
                onChange={e => setWordWrap(e.target.checked)}
                color="primary"
              />
            }
            label="Word Wrap"
          />
          
          <IconButton onClick={refetch} disabled={loading} title="Refresh">
            <RefreshIcon />
          </IconButton>
          
          <IconButton onClick={handleDownload} disabled={!logs || loading} title="Download">
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
              wordWrap={wordWrap}
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