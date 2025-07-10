import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';

export interface UsePodLogsOptions {
  podName: string;
  namespace: string;
  containerName?: string;
  clusterName: string;
  follow?: boolean;
  timestamps?: boolean;
  tailLines?: number;
}

export interface UsePodLogsResult {
  logs: string;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const usePodLogs = ({
  podName,
  namespace,
  containerName,
  clusterName,
  follow = false,
  timestamps = true,
  tailLines = 1000,
}: UsePodLogsOptions): UsePodLogsResult => {
  const kubernetesApi = useApi(kubernetesApiRef);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setLogs('');

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        timestamps: timestamps.toString(),
        tailLines: tailLines.toString(),
      });

      if (containerName) {
        queryParams.append('container', containerName);
      }

      if (follow) {
        queryParams.append('follow', 'true');
      }

      // Construct the path for the logs endpoint
      const path = `/api/v1/namespaces/${namespace}/pods/${podName}/log?${queryParams.toString()}`;

      // Make the API call through the Kubernetes proxy
      const response = await kubernetesApi.proxy({
        clusterName,
        path,
        init: {
          signal: abortControllerRef.current.signal,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      if (follow) {
        // For streaming logs, read the response as a stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          setLogs(prev => prev + chunk);
        }
      } else {
        // For non-streaming logs, read the entire response
        const text = await response.text();
        setLogs(text);
      }

      setLoading(false);
    } catch (err: any) {
      // Don't set error if the request was aborted
      if (err.name !== 'AbortError') {
        console.error('Error fetching logs:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
      }
      setLoading(false);
    }
  }, [
    kubernetesApi,
    podName,
    namespace,
    containerName,
    clusterName,
    follow,
    timestamps,
    tailLines,
  ]);

  useEffect(() => {
    fetchLogs();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
};