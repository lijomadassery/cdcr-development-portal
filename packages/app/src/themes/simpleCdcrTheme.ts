import {
  createUnifiedTheme,
  createBaseThemeOptions,
  palettes,
  UnifiedThemeProvider,
} from '@backstage/theme';

// CDCR Light Theme - Direct theme approach
export const cdcrLightTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.light,
      primary: {
        main: '#0f62fe', // CDCR Blue
      },
      secondary: {
        main: '#393939', // Carbon Gray 80
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
      text: {
        primary: '#161616',
        secondary: '#6f6f6f',
      },
    },
  }),
  fontFamily: '"IBM Plex Sans", "Helvetica", "Arial", sans-serif',
  defaultPageTheme: 'home',
  components: {
    // Global overrides to ensure light theme
    MuiCssBaseline: {
      styleOverrides: {
        '& .MuiDrawer-root .MuiPaper-root': {
          backgroundColor: '#f5f5f5 !important',
          backgroundImage: 'none !important',
        },
        '& .MuiDrawer-paper': {
          backgroundColor: '#f5f5f5 !important',
          backgroundImage: 'none !important',
        },
        '& [class*="BackstageSidebar"]': {
          backgroundColor: '#f5f5f5 !important',
          '& .MuiPaper-root': {
            backgroundColor: '#f5f5f5 !important',
          },
        },
        // Main content area border
        '& main': {
          borderLeft: '2px solid #d1d5db !important',
          boxShadow: 'inset 4px 0 8px -4px rgba(0, 0, 0, 0.05) !important',
        },
        '& [class*="makeStyles-content"]': {
          borderLeft: '2px solid #d1d5db !important',
          boxShadow: 'inset 4px 0 8px -4px rgba(0, 0, 0, 0.05) !important',
        },
        // Hide specific catalog filters by targeting their container divs
        '& .MuiGrid-item > div > div': {
          '&:has(> div > div > label[for*="lifecycle"]), &:has(> div > div > label[for*="Lifecycle"])': {
            display: 'none !important',
          },
          '&:has(> div > div > label[for*="processing"]), &:has(> div > div > label[for*="Processing"])': {
            display: 'none !important',
          },
          '&:has(> div > div > label[for*="namespace"]), &:has(> div > div > label[for*="Namespace"])': {
            display: 'none !important',
          },
          '&:has(> div > div > label[for*="personal"]), &:has(> div > div > label[for*="Personal"])': {
            display: 'none !important',
          },
        },
        // Alternative targeting - hide by section headings
        '& h6:contains("PERSONAL")': {
          '&, & + *': {
            display: 'none !important',
          },
        },
        // Try targeting form controls by their labels
        '& .MuiFormControl-root': {
          '&:has(.MuiInputLabel-root[id*="lifecycle"])': {
            display: 'none !important',
          },
          '&:has(.MuiInputLabel-root[id*="processing"])': {
            display: 'none !important',
          },
          '&:has(.MuiInputLabel-root[id*="namespace"])': {
            display: 'none !important',
          },
        },
      },
    },
    // Sidebar styling directly in theme
    MuiDrawer: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            backgroundColor: '#f5f5f5',
            backgroundImage: 'none',
            color: '#161616',
          },
        },
        paper: {
          backgroundColor: '#f5f5f5',
          backgroundImage: 'none',
          color: '#161616',
          borderRight: '2px solid #d1d5db',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
          '& .MuiTypography-root': {
            color: '#161616',
          },
          '& .MuiSvgIcon-root': {
            color: '#424242',
          },
        },
      },
    },
    
    // List item styling for sidebar
    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: '#ebebeb',
          },
          '&.Mui-selected': {
            backgroundColor: '#e8f4ff',
            borderLeft: '3px solid #0f62fe',
            paddingLeft: '13px',
            '&:hover': {
              backgroundColor: '#dbeafe',
            },
          },
        },
      },
    },
    
    // List item text styling
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#161616',
          textTransform: 'none',
          '.Mui-selected &': {
            color: '#0f62fe',
            fontWeight: 500,
          },
        },
        secondary: {
          color: '#6f6f6f',
          textTransform: 'none',
        },
      },
    },
    
    // List item icon styling
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#424242',
          minWidth: '40px',
          '.Mui-selected &': {
            color: '#0f62fe',
          },
        },
      },
    },
    
    // Paper component styling
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    
    // Divider styling
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#d1d5db',
          margin: '8px 0',
        },
      },
    },
    
    
    // Additional sidebar-specific overrides
    BackstageSidebar: {
      styleOverrides: {
        drawer: {
          '& .MuiDrawer-paper': {
            backgroundColor: '#f5f5f5 !important',
            backgroundImage: 'none !important',
            color: '#161616 !important',
            borderRight: '2px solid #d1d5db !important',
            boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1) !important',
          },
          '& .MuiPaper-root': {
            backgroundColor: '#f5f5f5 !important',
            backgroundImage: 'none !important',
          },
          '& .MuiTypography-root': {
            color: '#161616 !important',
          },
          '& .MuiListItemText-primary': {
            color: '#161616 !important',
            whiteSpace: 'normal !important',
            wordBreak: 'break-word !important',
            textTransform: 'none !important',
          },
          '& .MuiListItemIcon-root': {
            color: '#424242 !important',
            minWidth: '40px !important',
          },
          '& .MuiSvgIcon-root': {
            color: '#424242 !important',
            fontSize: '1.25rem !important',
          },
          '& .MuiListItem-root': {
            color: '#161616 !important',
            paddingRight: '16px !important',
            '&:hover': {
              backgroundColor: '#f4f4f4 !important',
            },
            '&.Mui-selected': {
              backgroundColor: '#e8f4ff !important',
              '& .MuiListItemText-primary': {
                color: '#0f62fe !important',
              },
              '& .MuiListItemIcon-root': {
                color: '#0f62fe !important',
              },
              '& .MuiSvgIcon-root': {
                color: '#0f62fe !important',
              },
            },
          },
          // Force sidebar header/logo area to match
          '& .MuiToolbar-root': {
            backgroundColor: '#f5f5f5 !important',
            color: '#161616 !important',
            borderBottom: '1px solid #e0e0e0 !important',
          },
          // Force any nested dark backgrounds to light gray
          '& [class*="BackstageSidebar-drawer"]': {
            backgroundColor: '#f5f5f5 !important',
          },
        },
      },
    },
    
    // Main content area styling
    BackstageContent: {
      styleOverrides: {
        root: {
          borderLeft: '2px solid #d1d5db !important',
          marginLeft: '0 !important',
          boxShadow: 'inset 4px 0 8px -4px rgba(0, 0, 0, 0.05) !important',
        },
      },
    },
    
    // Page container styling
    BackstagePage: {
      styleOverrides: {
        root: {
          '& > div:nth-child(2)': {
            borderLeft: '2px solid #d1d5db !important',
            boxShadow: 'inset 4px 0 8px -4px rgba(0, 0, 0, 0.05) !important',
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