import React from 'react';
import {
  SettingsLayout,
  UserSettingsGeneral,
  UserSettingsAuthProviders,
} from '@backstage/plugin-user-settings';

export const CustomSettingsPage = () => (
  <SettingsLayout>
    <SettingsLayout.Route path="general" title="General">
      <UserSettingsGeneral />
    </SettingsLayout.Route>
    <SettingsLayout.Route path="auth-providers" title="Auth Providers">
      <UserSettingsAuthProviders />
    </SettingsLayout.Route>
  </SettingsLayout>
);