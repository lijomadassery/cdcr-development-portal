import { useState } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import { LogsModal } from '../LogsModal';

export interface LogsButtonProps {
  podName: string;
  namespace: string;
  containerName?: string;
  clusterName: string;
}

export const LogsButton = ({ 
  podName, 
  namespace, 
  containerName,
  clusterName 
}: LogsButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="View Logs">
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          data-testid="logs-button"
        >
          <DescriptionIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <LogsModal
        open={open}
        onClose={() => setOpen(false)}
        podName={podName}
        namespace={namespace}
        containerName={containerName}
        clusterName={clusterName}
      />
    </>
  );
};