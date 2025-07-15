
import {
  Page,
  Header,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { Typography } from '@material-ui/core';

export const KubernetesLogsPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Kubernetes Logs" subtitle="View and search pod logs across clusters">
        <SupportButton>
          View logs for pods running in your Kubernetes clusters
        </SupportButton>
      </Header>
      <Content>
        <ContentHeader title="Pod Logs">
          <SupportButton />
        </ContentHeader>
        <Typography>
          This page will show aggregated logs view. For now, use the logs button
          on individual pods in the Kubernetes tab of entity pages.
        </Typography>
      </Content>
    </Page>
  );
};