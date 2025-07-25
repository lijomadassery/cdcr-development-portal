import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  githubAuthApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
} from '@backstage/core-plugin-api';
import { GithubAuth } from '@backstage/core-app-api';


export const apis: AnyApiFactory[] = [
  // GitHub Auth API - Required for GitHub authentication
  createApiFactory({
    api: githubAuthApiRef,
    deps: {
      configApi: configApiRef,
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
    },
    factory: ({ configApi, discoveryApi, oauthRequestApi }) => GithubAuth.create({
      configApi,
      discoveryApi,
      oauthRequestApi,
      defaultScopes: ["read:user", "user:email"],
    })
  }),

  // SCM Integrations API - Required for repository integrations
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  
  // SCM Auth - Default factory for SCM authentication
  ScmAuth.createDefaultApiFactory(),

  // Kubernetes API - Let the plugin handle the factory
];