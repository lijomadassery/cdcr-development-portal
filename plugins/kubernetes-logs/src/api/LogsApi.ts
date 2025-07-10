import { createApiRef } from '@backstage/core-plugin-api';

export interface LogsApi {
  getPodLogs(options: {
    clusterName: string;
    namespace: string;
    podName: string;
    containerName?: string;
    follow?: boolean;
    timestamps?: boolean;
    tailLines?: number;
  }): Promise<string | EventSource>;

  getDeploymentLogs(options: {
    clusterName: string;
    namespace: string;
    deploymentName: string;
    follow?: boolean;
    timestamps?: boolean;
    tailLines?: number;
  }): Promise<{ [podName: string]: string }>;
}

export const logsApiRef = createApiRef<LogsApi>({
  id: 'plugin.kubernetes-logs',
});