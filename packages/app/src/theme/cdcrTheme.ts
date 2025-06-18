import { createUnifiedTheme, palettes } from '@backstage/theme';

export const cdcrTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: {
      main: '#005a9c', // CDCR Blue
    },
    secondary: {
      main: '#6a7f10', // CDCR Green
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    banner: {
      info: '#005a9c',
      error: '#d32f2f',
      text: '#ffffff',
      link: '#ffffff',
    },
    errorBackground: '#ffebee',
    warningBackground: '#fff3e0',
    infoBackground: '#e3f2fd',
    navigation: {
      background: '#005a9c',
      indicator: '#6a7f10',
      color: '#ffffff',
      selectedColor: '#ffffff',
    },
  },
  defaultPageTheme: 'home',
  fontFamily: '"Helvetica Neue", Helvetica, Roboto, Arial, sans-serif',
  htmlFontSize: 16,
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
});

export const cdcrDarkTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: {
      main: '#4da3d4', // Lighter blue for dark mode
    },
    secondary: {
      main: '#8bc34a', // Lighter green for dark mode
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    banner: {
      info: '#2196f3',
      error: '#f44336',
      text: '#ffffff',
      link: '#ffffff',
    },
    errorBackground: '#ffebee',
    warningBackground: '#fff3e0',
    infoBackground: '#e3f2fd',
    navigation: {
      background: '#1e1e1e',
      indicator: '#8bc34a',
      color: '#ffffff',
      selectedColor: '#ffffff',
    },
  },
  defaultPageTheme: 'home',
  fontFamily: '"Helvetica Neue", Helvetica, Roboto, Arial, sans-serif',
  htmlFontSize: 16,
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
});