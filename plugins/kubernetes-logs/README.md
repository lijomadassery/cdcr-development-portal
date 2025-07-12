# Kubernetes Logs Plugin

This plugin extends the Backstage Kubernetes plugin with log viewing capabilities.

**Version 1.2.0** - Production ready with proper build configuration.

## Features

- View logs for individual pods
- Stream logs in real-time
- Search and filter log output
- Download logs as text files
- Support for multi-container pods
- Timestamps toggle
- Follow mode for live log streaming

## Installation

1. Add the plugin to your frontend app:

```typescript
// packages/app/src/App.tsx
import { EntityKubernetesLogsContent } from '@internal/plugin-kubernetes-logs';

// Add to your entity page tabs
<EntityLayout.Route path="/kubernetes-logs" title="Logs">
  <EntityKubernetesLogsContent />
</EntityLayout.Route>
```

2. Install dependencies:

```bash
# From the repository root
yarn --cwd plugins/kubernetes-logs install
yarn install
```

## Usage

The plugin provides a `LogsButton` component that can be integrated into the Kubernetes plugin's pod tables.

### Integration with Kubernetes Plugin

To add log buttons to the pod table, you'll need to customize the Kubernetes plugin's display. This can be done by:

1. Creating a custom wrapper around the Kubernetes content
2. Using React portals to inject buttons into the existing UI
3. Or waiting for official extension points in the Kubernetes plugin

### Standalone Usage

```typescript
import { LogsButton } from '@internal/plugin-kubernetes-logs';

<LogsButton
  podName="my-pod"
  namespace="default"
  clusterName="production"
  containerName="app" // optional
/>
```

## API

The plugin uses the Kubernetes API proxy provided by the Backstage Kubernetes plugin to fetch logs.

## Configuration

No additional configuration is required. The plugin uses the existing Kubernetes plugin configuration for cluster access.

## Development

To start the plugin in isolation:

```bash
yarn --cwd plugins/kubernetes-logs start
```

## Future Enhancements

- Aggregate logs from all pods in a deployment
- Log export with date ranges
- Advanced filtering and search
- Log persistence and historical viewing
- Integration with external logging systems