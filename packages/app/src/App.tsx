import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  CatalogTable,
  CatalogTableColumnsFunc,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
} from '@backstage/plugin-catalog-import';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { kubernetesPlugin } from '@backstage/plugin-kubernetes';
import { kubernetesLogsPlugin } from '@internal/plugin-kubernetes-logs';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { cdcrLightTheme, cdcrDarkTheme, UnifiedThemeProvider } from './themes/simpleCdcrTheme';

// Custom columns function to remove the TAGS column from the catalog table
const customCatalogColumns: CatalogTableColumnsFunc = () => {
  return [
    CatalogTable.columns.createNameColumn({ defaultKind: 'Component' }),
    CatalogTable.columns.createSystemColumn(),
    CatalogTable.columns.createOwnerColumn(),
    CatalogTable.columns.createSpecTypeColumn(),
    CatalogTable.columns.createSpecLifecycleColumn(),
  ];
};



const app = createApp({
  apis,
  plugins: [kubernetesPlugin, kubernetesLogsPlugin],
  themes: [
    {
      id: 'cdcr-dark',
      title: 'CDCR Dark',
      variant: 'dark',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={cdcrDarkTheme} children={children} />
      ),
    },
    {
      id: 'cdcr-light',
      title: 'CDCR Light',
      variant: 'light',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={cdcrLightTheme} children={children} />
      ),
    },
  ],
  bindRoutes({ bind }) {
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  components: {
    SignInPage: props => (
      <SignInPage
        {...props}
        auto
        providers={[
          'guest',
          {
            id: 'github-auth-provider',
            title: 'GitHub',
            message: 'Sign in using GitHub',
            apiRef: githubAuthApiRef,
          },
        ]}
      />
    ),
  },
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage columns={customCatalogColumns} />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
  </FlatRoutes>
);

// Component to hide unwanted filters - much more conservative
const FilterHider = () => {
  React.useEffect(() => {
    const hideFilters = () => {
      // Only target elements in the sidebar filter area
      const sidebarFilters = document.querySelector('.MuiGrid-container .MuiGrid-item:first-child');
      if (!sidebarFilters) return;

      // Look for specific filter labels only in the filter sidebar
      const filterLabels = sidebarFilters.querySelectorAll('label, .MuiTypography-root, .MuiInputLabel-root');
      
      filterLabels.forEach(label => {
        const text = label.textContent?.trim() || '';
        if (text === 'Lifecycle' || text === 'Processing Status' || 
            text === 'Namespace' || text === 'Tags' || 
            text === 'PERSONAL') {
          
          // Only hide the immediate parent form control or section
          const parent = label.closest('.MuiFormControl-root') || 
                        label.closest('div[class*="section"]') ||
                        label.parentElement;
          
          if (parent && parent !== sidebarFilters) {
            (parent as HTMLElement).style.display = 'none';
          }
        }
      });

      console.log('Conservative filter hiding attempted');
    };

    // Run just once after page load
    setTimeout(hideFilters, 2000);
  }, []);

  return null;
};

export default app.createRoot(
  <>
    <FilterHider />
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
