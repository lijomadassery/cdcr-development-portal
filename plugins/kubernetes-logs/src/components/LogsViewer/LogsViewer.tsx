import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  logsViewer: {
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '12px',
    lineHeight: '1.5',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? '#1e1e1e' : '#f5f5f5',
    color: theme.palette.type === 'dark' ? '#d4d4d4' : '#333',
    minHeight: '100%',
    overflowX: 'auto',
  },
  logsViewerWrap: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  logsViewerNoWrap: {
    whiteSpace: 'pre',
    wordBreak: 'normal',
  },
  highlight: {
    backgroundColor: theme.palette.type === 'dark' ? '#3a3d41' : '#ffeb3b',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
  // Log level colors
  errorLevel: {
    color: '#ff5252',
    fontWeight: 500,
  },
  warnLevel: {
    color: '#ff9800',
    fontWeight: 500,
  },
  infoLevel: {
    color: '#2196f3',
  },
  debugLevel: {
    color: '#9e9e9e',
  },
  // Common log patterns
  timestamp: {
    color: theme.palette.type === 'dark' ? '#89b4fa' : '#1976d2',
  },
  namespace: {
    color: theme.palette.type === 'dark' ? '#a6e3a1' : '#388e3c',
  },
  podName: {
    color: theme.palette.type === 'dark' ? '#f9e2af' : '#f57c00',
  },
  jsonKey: {
    color: theme.palette.type === 'dark' ? '#cba6f7' : '#7b1fa2',
  },
  quotedString: {
    color: theme.palette.type === 'dark' ? '#94e2d5' : '#00695c',
  },
  number: {
    color: theme.palette.type === 'dark' ? '#fab387' : '#e65100',
  },
}));

export interface LogsViewerProps {
  logs: string;
  searchTerm?: string;
  follow?: boolean;
  wordWrap?: boolean;
}

export const LogsViewer = ({ logs, searchTerm, follow, wordWrap = true }: LogsViewerProps) => {
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

  // Color coding function
  const colorizeLogLine = (line: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Define patterns for different log elements
    const patterns = [
      // Log levels
      { regex: /\b(ERROR|SEVERE|FATAL)\b/gi, className: classes.errorLevel },
      { regex: /\b(WARN|WARNING)\b/gi, className: classes.warnLevel },
      { regex: /\b(INFO|INFORMATION)\b/gi, className: classes.infoLevel },
      { regex: /\b(DEBUG|TRACE|VERBOSE)\b/gi, className: classes.debugLevel },
      // Timestamps (ISO format, common formats)
      { regex: /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[\.\d]*(Z|[+-]\d{2}:\d{2})?/g, className: classes.timestamp },
      { regex: /\d{2}:\d{2}:\d{2}[\.\d]*/g, className: classes.timestamp },
      // Kubernetes namespace/pod patterns
      { regex: /namespace[=:]\s*"?([a-zA-Z0-9-]+)"?/gi, className: classes.namespace },
      { regex: /pod[=:]\s*"?([a-zA-Z0-9-]+)"?/gi, className: classes.podName },
      // JSON-like key-value pairs
      { regex: /"([^"]+)":/g, className: classes.jsonKey },
      // Quoted strings
      { regex: /"([^"]*)"/g, className: classes.quotedString },
      { regex: /'([^']*)'/g, className: classes.quotedString },
      // Numbers
      { regex: /\b\d+\.?\d*\b/g, className: classes.number },
    ];

    // Apply patterns
    const replacements: Array<{ start: number; end: number; element: React.ReactNode }> = [];

    patterns.forEach(({ regex, className }) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          element: <span key={`${match.index}-${className}`} className={className}>{match[0]}</span>
        });
      }
    });

    // Sort replacements by start position and remove overlaps
    replacements.sort((a, b) => a.start - b.start);
    const nonOverlapping: typeof replacements = [];
    let lastEnd = 0;
    
    replacements.forEach(replacement => {
      if (replacement.start >= lastEnd) {
        nonOverlapping.push(replacement);
        lastEnd = replacement.end;
      }
    });

    // Build the final colorized line
    lastIndex = 0;
    nonOverlapping.forEach((replacement) => {
      if (replacement.start > lastIndex) {
        parts.push(line.substring(lastIndex, replacement.start));
      }
      parts.push(replacement.element);
      lastIndex = replacement.end;
    });
    
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  const processedLogs = React.useMemo(() => {
    const lines = logs.split('\n');
    
    return lines.map((line, lineIndex) => {
      let content: React.ReactNode = colorizeLogLine(line);
      
      // Apply search highlighting on top of colorization
      if (searchTerm) {
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        
        if (typeof content === 'string') {
          content = content.split(searchRegex).map((part, partIndex) => {
            if (searchRegex.test(part)) {
              return <span key={`search-${lineIndex}-${partIndex}`} className={classes.highlight}>{part}</span>;
            }
            return part;
          });
        }
      }
      
      return (
        <div key={lineIndex}>
          {content}
        </div>
      );
    });
  }, [logs, searchTerm, classes]);

  return (
    <div
      ref={containerRef}
      className={`${classes.logsViewer} ${wordWrap ? classes.logsViewerWrap : classes.logsViewerNoWrap}`}
      onScroll={handleScroll}
    >
      {processedLogs}
    </div>
  );
};