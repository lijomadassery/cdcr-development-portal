import React, { useEffect, useRef } from 'react';
import { Box, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  logsViewer: {
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '12px',
    lineHeight: '1.5',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? '#1e1e1e' : '#f5f5f5',
    color: theme.palette.type === 'dark' ? '#d4d4d4' : '#333',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    minHeight: '100%',
  },
  highlight: {
    backgroundColor: theme.palette.type === 'dark' ? '#3a3d41' : '#ffeb3b',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
}));

export interface LogsViewerProps {
  logs: string;
  searchTerm?: string;
  follow?: boolean;
}

export const LogsViewer = ({ logs, searchTerm, follow }: LogsViewerProps) => {
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (follow && shouldScrollRef.current && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [logs, follow]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const isAtBottom = 
      container.scrollHeight - container.scrollTop === container.clientHeight;
    
    shouldScrollRef.current = isAtBottom;
  };

  const highlightedLogs = React.useMemo(() => {
    if (!searchTerm) return logs;

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    return logs.split(regex).map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className={classes.highlight}>
            {part}
          </span>
        );
      }
      return part;
    });
  }, [logs, searchTerm, classes.highlight]);

  return (
    <Box
      ref={containerRef}
      className={classes.logsViewer}
      onScroll={handleScroll}
    >
      {highlightedLogs}
    </Box>
  );
};