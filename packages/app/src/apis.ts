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
  guestAuthApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
} from '@backstage/core-plugin-api';
import { GithubAuth, GuestAuth } from '@backstage/core-app-api';

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
      defaultScopes: ["read:user"],
    })
  }),

  // Guest Auth API - Required for guest authentication
  createApiFactory({
    api: guestAuthApiRef,
    deps: {
      configApi: configApiRef,
      discoveryApi: discoveryApiRef,
    },
    factory: ({ configApi, discoveryApi }) => GuestAuth.create({
      configApi,
      discoveryApi,
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
];