import { makeStyles, Theme, Paper, Typography } from '@material-ui/core';
import {
  CatalogTable,
  CatalogTableColumnsFunc,
} from '@backstage/plugin-catalog';
import {
  EntityListProvider,
  EntityKindPicker,
  EntityTypePicker,
  EntityOwnerPicker,
} from '@backstage/plugin-catalog-react';
import {
  Content,
  Header,
  Page,
} from '@backstage/core-components';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  filtersContainer: {
    marginBottom: theme.spacing(3),
  },
  filterPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  filterItem: {
    minWidth: 200,
    flex: '1 1 auto',
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
}));

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

export const CatalogPage = () => {
  const classes = useStyles();

  return (
    <Page themeId="home">
      <Header title="CDCR Service Catalog" subtitle="Manage and discover services across the organization" />
      <Content>
        <EntityListProvider>
          <div className={classes.container}>
            {/* Filters at the top */}
            <div className={classes.filtersContainer}>
              <Paper className={classes.filterPaper}>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>
                <div className={classes.filterRow}>
                  <div className={classes.filterItem}>
                    <EntityKindPicker />
                  </div>
                  <div className={classes.filterItem}>
                    <EntityTypePicker />
                  </div>
                  <div className={classes.filterItem}>
                    <EntityOwnerPicker />
                  </div>
                </div>
              </Paper>
            </div>

            {/* Table below filters */}
            <div className={classes.tableContainer}>
              <CatalogTable columns={customCatalogColumns} />
            </div>
          </div>
        </EntityListProvider>
      </Content>
    </Page>
  );
}; 