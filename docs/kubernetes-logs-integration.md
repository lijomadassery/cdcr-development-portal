# Kubernetes Logs Integration

This document describes the kubernetes-logs plugin integration with the CDCR Backstage portal.

## Overview

The kubernetes-logs plugin extends the existing Backstage Kubernetes plugin to add log viewing capabilities directly in the entity pages.

## Features

- **Pod Logs Viewer**: View logs for any pod directly from the Kubernetes tab
- **Real-time Streaming**: Support for following logs in real-time
- **Search & Filter**: Search within logs with highlighting
- **Download**: Export logs as text files
- **Multi-container Support**: Select specific containers in multi-container pods
- **Timestamps**: Toggle timestamps on/off
- **Auto-scroll**: Automatically scroll to bottom when following logs

## Architecture

### Frontend Components

1. **LogsButton**: Simple button component that opens the logs modal
2. **LogsModal**: Full-featured modal dialog for viewing logs
3. **LogsViewer**: Syntax-highlighted log viewer with search
4. **KubernetesContentWithLogs**: Wrapper that adds logs functionality to EntityKubernetesContent

### Integration Points

The plugin integrates with the existing Kubernetes plugin by:
- Using the `useKubernetesObjects` hook to get pod information
- Leveraging the `kubernetesApiRef` for API calls
- Adding an accordion section below the standard Kubernetes content

### API Usage

The plugin uses the Kubernetes backend proxy to fetch logs:
```typescript
const response = await kubernetesApi.proxy({
  clusterName,
  path: `/api/v1/namespaces/${namespace}/pods/${podName}/log?${queryParams}`,
});
```

## Usage

The integration is automatic. When viewing an entity with Kubernetes resources:

1. Navigate to the entity page
2. Click on the "Kubernetes" tab
3. Scroll down to see the "Pod Logs" accordion
4. Click the logs button next to any pod

## Configuration

No additional configuration is required. The plugin uses the existing Kubernetes plugin configuration.

## Security

- Uses the same service account permissions as the Kubernetes plugin
- Read-only access to pod logs
- Respects RBAC permissions configured in your clusters

## Troubleshooting

### Logs not appearing
- Ensure the Kubernetes plugin is properly configured
- Check that service accounts have permission to read pod logs
- Verify pods are running and have generated logs

### Streaming not working
- Check browser console for WebSocket errors
- Ensure proxy configuration allows streaming responses
- Verify network policies allow log streaming

## Future Enhancements

- Aggregate logs from all pods in a deployment
- Historical log viewing with date ranges
- Integration with external logging systems (ELK, Splunk, etc.)
- Log export with filters applied
- Performance metrics and log analysis