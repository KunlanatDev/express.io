import { BorderAll } from '@mui/icons-material';
import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark') => ({
    palette: {
        mode,
        primary: {
            main: '#2563EB', // Trustworthy Blue (Royal Blue)
            light: '#60A5FA',
            dark: '#1E40AF',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#7C3AED', // Electric Violet
            light: '#A78BFA',
            dark: '#5B21B6',
            contrastText: '#ffffff',
        },
        info: {
            main: '#06B6D4', // Teal/Cyan Accent
        },
        background: {
            default: mode === 'dark' ? '#0F172A' : '#F8FAFC', // Slate-900 / Slate-50
            paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',   // Slate-800 / White
        },
        text: {
            primary: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            secondary: mode === 'dark' ? '#94A3B8' : '#64748B',
        },
        success: {
            main: '#10B981', // Emerald
        },
        warning: {
            main: '#F59E0B', // Amber
        },
        error: {
            main: '#EF4444', // Red
        },
    },
    typography: {
        fontFamily: '"Inter", "Prompt", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.025em' },
        h2: { fontWeight: 800, letterSpacing: '-0.025em' },
        h3: { fontWeight: 700, letterSpacing: '-0.025em' },
        h4: { fontWeight: 700, letterSpacing: '-0.025em' },
        h5: { fontWeight: 600, letterSpacing: '-0.025em' },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontSize: '0.75rem' },
        button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.01em' },
    },
    shape: {
        borderRadius: 16, // User requested 14-18px
    },
    divider: {
        main: '#E6EDF7',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    height: '44px',
                    borderRadius: '22px',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    // '&:hover': {
                    //     transform: 'translateY(-1px)',
                    //     boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', // Blue shadow
                    // },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                },
                sizeLarge: {
                    height: 56,
                    fontSize: '1.125rem',
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: mode === 'dark'
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)', // Soft shadow
                    transition: 'box-shadow 0.3s ease-in-out',
                },
                elevation1: {
                    boxShadow: mode === 'dark'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: mode === 'dark' ? alpha('#fff', 0.03) : '#FFFFFF',
                        transition: 'all 0.2s',
                        '& fieldset': { borderColor: mode === 'dark' ? alpha('#fff', 0.1) : '#E2E8F0' }, // Slate-200
                        '&:hover fieldset': { borderColor: '#2563EB' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 4px ${alpha('#2563EB', 0.1)}`
                        }
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.95rem',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 8,
                }
            }
        }
    },
});

export const theme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
