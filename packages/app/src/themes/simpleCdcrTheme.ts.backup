import {
  createUnifiedTheme,
  createBaseThemeOptions,
  palettes,
  UnifiedThemeProvider,
} from '@backstage/theme';

// CDCR Light Theme using proper Backstage theming
export const cdcrLightTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.light,
      primary: {
        main: '#1565c0', // CDCR Blue
      },
      secondary: {
        main: '#0d47a1', // Darker CDCR Blue
      },
    },
  }),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  defaultPageTheme: 'home',
  components: {
    // Override SignInPage to make it more compact
    MuiCard: {
      styleOverrides: {
        root: {
          '&.MuiCard-root': {
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '8px !important',
          '&:last-child': {
            paddingBottom: '8px !important',
          },
        },
      },
    },
  },
});

// CDCR Dark Theme
export const cdcrDarkTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.dark,
      primary: {
        main: '#42a5f5', // Lighter blue for dark theme
      },
      secondary: {
        main: '#1565c0',
      },
    },
  }),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  defaultPageTheme: 'home',
});

export { UnifiedThemeProvider };