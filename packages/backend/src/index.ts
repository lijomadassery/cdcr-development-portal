/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import * as https from 'https';
import * as http from 'http';
import { HttpsProxyAgent } from 'https-proxy-agent';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
// See https://backstage.io/docs/auth/github/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

// Configure proxy if HTTPS_PROXY environment variable is set
// Use a more compatible approach for newer Node.js versions
if (process.env.HTTPS_PROXY) {
  const httpsProxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  
  // Override the default request methods to use the proxy agent
  const originalHttpsRequest = https.request;
  const originalHttpsGet = https.get;
  
  https.request = function(options: any, callback?: any) {
    if (typeof options === 'string') {
      options = new URL(options);
    }
    if (!options.agent && options.protocol === 'https:') {
      options.agent = httpsProxyAgent;
    }
    return originalHttpsRequest.call(this, options, callback);
  };
  
  https.get = function(options: any, callback?: any) {
    if (typeof options === 'string') {
      options = new URL(options);
    }
    if (!options.agent && options.protocol === 'https:') {
      options.agent = httpsProxyAgent;
    }
    return originalHttpsGet.call(this, options, callback);
  };
  
  console.log(`Configured HTTPS proxy agent: ${process.env.HTTPS_PROXY}`);
}

backend.start();
