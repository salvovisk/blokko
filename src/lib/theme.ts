import { createTheme } from '@mui/material/styles';
import { swissTheme } from '@/styles/swiss-theme';

const { colors, typography } = swissTheme;

// MUI is aligned to the Swiss tokens so its components (Tooltip, Modal,
// TextField, Chip) read as part of the same system: mono palette, no radius.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.black,
      light: colors.gray,
      dark: colors.black,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.gray,
      light: colors.lightGray,
      dark: colors.black,
      contrastText: colors.white,
    },
    error: {
      main: colors.error,
      light: colors.error,
      dark: colors.error,
      contrastText: colors.white,
    },
    text: {
      primary: colors.black,
      secondary: colors.gray,
    },
    divider: colors.lightGray,
    background: {
      default: colors.white,
      paper: colors.white,
    },
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 700 },
    h4: { fontSize: '1.5rem', fontWeight: 700 },
    h5: { fontSize: '1.25rem', fontWeight: 700 },
    h6: { fontSize: '1rem', fontWeight: 700 },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: Array(25).fill('none') as ReturnType<typeof createTheme>['shadows'],
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 700,
          letterSpacing: '0.1em',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      // Tooltips open on keyboard focus as well as hover (MUI default);
      // a string title also names icon-only buttons.
      defaultProps: {
        enterDelay: 300,
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.black,
          color: colors.white,
          borderRadius: 0,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '8px 12px',
        },
        arrow: { color: colors.black },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 0, fontWeight: 700 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
  },
});
