import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';

interface PodInfo {
  name: string;
  namespace: string;
  containerName?: string;
}

interface UseDeploymentLogsOptions {
  pods: PodInfo[];
  namespace: string;
  clusterName: string;
  follow?: boolean;
  timestamps?: boolean;
  tailLines?: number;
}

interface UseDeploymentLogsResult {
  logsData: Record<string, string>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  refetchAll: () => void;
  refetchPod: (podName: string) => void;
}

export const useDeploymentLogs = ({
  pods,
  namespace,
  clusterName,
  follow = false,
  timestamps = true,
  tailLines = 1000,
}: UseDeploymentLogsOptions): UseDeploymentLogsResult => {
  const kubernetesApi = useApi(kubernetesApiRef);
  
  // Use refs to store state that shouldn't trigger re-renders
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const eventSourcesRef = useRef<Record<string, EventSource>>({});
  
  // State for logs data, loading, and errors
  const [logsData, setLogsData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cleanup function for a specific pod
  const cleanupPod = useCallback((podName: string) => {
    if (abortControllersRef.current[podName]) {
      abortControllersRef.current[podName].abort();
      delete abortControllersRef.current[podName];
    }
    if (eventSourcesRef.current[podName]) {
      eventSourcesRef.current[podName].close();
      delete eventSourcesRef.current[podName];
    }
  }, []);

  // Fetch logs for a single pod
  const fetchPodLogs = useCallback(async (pod: PodInfo) => {
    const { name: podName } = pod;
    
    // Clean up any existing connections
    cleanupPod(podName);
    
    // Set loading state
    setLoading(prev => ({ ...prev, [podName]: true }));
    setErrors(prev => ({ ...prev, [podName]: '' }));
    
    try {
      const abortController = new AbortController();
      abortControllersRef.current[podName] = abortController;
      
      const params = new URLSearchParams({
        container: pod.containerName || '',
        tailLines: tailLines.toString(),
        timestamps: timestamps.toString(),
        follow: follow.toString(),
      });
      
      const proxyPath = `/api/proxy/v1/clusters/${clusterName}/api/v1/namespaces/${namespace}/pods/${podName}/log?${params}`;
      
      if (follow) {
        // Use EventSource for streaming logs
        const eventSource = new EventSource(
          `${kubernetesApi.getProxy()}${proxyPath}`,
          {
            withCredentials: true,
          }
        );
        
        eventSourcesRef.current[podName] = eventSource;
        
        let accumulatedLogs = '';
        
        eventSource.onmessage = (event) => {
          accumulatedLogs += event.data + '\n';
          setLogsData(prev => ({ ...prev, [podName]: accumulatedLogs }));
        };
        
        eventSource.onerror = (error) => {
          console.error(`EventSource error for pod ${podName}:`, error);
          setErrors(prev => ({ ...prev, [podName]: 'Failed to stream logs' }));
          setLoading(prev => ({ ...prev, [podName]: false }));
          eventSource.close();
        };
        
        eventSource.onopen = () => {
          setLoading(prev => ({ ...prev, [podName]: false }));
        };
      } else {
        // Use regular fetch for non-streaming logs
        const response = await fetch(
          `${kubernetesApi.getProxy()}${proxyPath}`,
          {
            signal: abortController.signal,
            credentials: 'include',
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }
        
        const logs = await response.text();
        setLogsData(prev => ({ ...prev, [podName]: logs }));
        setLoading(prev => ({ ...prev, [podName]: false }));
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error(`Error fetching logs for pod ${podName}:`, error);
        setErrors(prev => ({ 
          ...prev, 
          [podName]: error.message || 'Failed to fetch logs' 
        }));
      }
      setLoading(prev => ({ ...prev, [podName]: false }));
    }
  }, [kubernetesApi, namespace, clusterName, follow, timestamps, tailLines, cleanupPod]);

  // Fetch logs for all pods
  const fetchAllLogs = useCallback(() => {
    pods.forEach(pod => {
      fetchPodLogs(pod);
    });
  }, [pods, fetchPodLogs]);

  // Refetch logs for a specific pod
  const refetchPod = useCallback((podName: string) => {
    const pod = pods.find(p => p.name === podName);
    if (pod) {
      fetchPodLogs(pod);
    }
  }, [pods, fetchPodLogs]);

  // Initial fetch and updates when dependencies change
  useEffect(() => {
    fetchAllLogs();
    
    // Cleanup on unmount or when dependencies change
    return () => {
      Object.keys(abortControllersRef.current).forEach(cleanupPod);
    };
  }, [fetchAllLogs, cleanupPod]);

  // Memoize the result to prevent unnecessary re-renders
  return {
    logsData,
    loading,
    errors,
    refetchAll: fetchAllLogs,
    refetchPod,
  };
};