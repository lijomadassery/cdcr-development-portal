import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const kubernetesLogsPlugin = createPlugin({
  id: 'kubernetes-logs',
  routes: {
    root: rootRouteRef,
  },
});

export const KubernetesLogsPage = kubernetesLogsPlugin.provide(
  createRoutableExtension({
    name: 'KubernetesLogsPage',
    component: () =>
      import('./components/KubernetesLogsPage').then(m => m.KubernetesLogsPage),
    mountPoint: rootRouteRef,
  }),
);

export const EntityKubernetesLogsContent = kubernetesLogsPlugin.provide(
  createComponentExtension({
    name: 'EntityKubernetesLogsContent',
    component: {
      lazy: () =>
        import('./components/EntityKubernetesLogsContent').then(
          m => m.EntityKubernetesLogsContent,
        ),
    },
  }),
);