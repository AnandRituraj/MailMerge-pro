import { createTheme, alpha } from '@mui/material/styles';

// Main theme creation function
export const createAppTheme = () => {
    // Always use dark mode

    // Define dark mode colors
    const darkPalette = {
        primary: {
            main: '#4a8cff', // Brighter blue
            light: '#7aaeff',
            dark: '#2d6ad4', // More saturated dark blue
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9f75ff', // Brighter purple
            light: '#c29fff',
            dark: '#7a4bed', // More saturated dark purple
            contrastText: '#ffffff',
        },
        background: {
            default: '#0f0f18', // Darker background
            paper: '#181824', // Slightly adjusted
            card: '#1c1c2c', // Slightly adjusted
            darker: '#0a0a14', // Even darker
            gradient: 'linear-gradient(145deg, #12121e 0%, #1e1e2e 100%)', // Enhanced gradient
        },
        error: {
            main: '#f55252', // More vibrant red
            light: '#ff8080',
            dark: '#d32f2f',
        },
        warning: {
            main: '#ffaa33', // More vibrant orange
            light: '#ffc266',
            dark: '#e67e22',
        },
        info: {
            main: '#33b9ff', // More vibrant blue
            light: '#66ccff',
            dark: '#0288d1',
        },
        success: {
            main: '#5ecd73', // More vibrant green
            light: '#8edf9d',
            dark: '#2e7d41',
        },
        text: {
            primary: '#ffffff', // Brighter for better contrast
            secondary: '#b8b8c0', // Slightly more colorful
            disabled: '#6c6c7c', // Slightly more colorful
            hint: '#9e9eae', // Slightly more colorful
        },
        divider: 'rgba(255, 255, 255, 0.1)', // Slightly more visible
        action: {
            active: 'rgba(255, 255, 255, 0.8)', // More visible
            hover: 'rgba(255, 255, 255, 0.12)', // Slightly more visible
            selected: 'rgba(255, 255, 255, 0.18)', // Slightly more visible
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
        }
    };

    // Create the theme
    const theme = createTheme({
        palette: {
            mode: 'dark',
            ...darkPalette,
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 700,
                fontSize: '2.5rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01562em',
            },
            h2: {
                fontWeight: 600,
                fontSize: '2rem',
                lineHeight: 1.3,
                letterSpacing: '-0.00833em',
            },
            h3: {
                fontWeight: 600,
                fontSize: '1.75rem',
                lineHeight: 1.4,
                letterSpacing: '0em',
            },
            h4: {
                fontWeight: 500,
                fontSize: '1.5rem',
                lineHeight: 1.4,
                letterSpacing: '0.00735em',
            },
            h5: {
                fontWeight: 500,
                fontSize: '1.25rem',
                lineHeight: 1.5,
                letterSpacing: '0em',
            },
            h6: {
                fontWeight: 500,
                fontSize: '1rem',
                lineHeight: 1.6,
                letterSpacing: '0.0075em',
            },
            subtitle1: {
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: 1.75,
                letterSpacing: '0.00938em',
            },
            subtitle2: {
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: 1.57,
                letterSpacing: '0.00714em',
            },
            body1: {
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: 1.5,
                letterSpacing: '0.00938em',
            },
            body2: {
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: 1.43,
                letterSpacing: '0.01071em',
            },
            button: {
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: 1.75,
                letterSpacing: '0.02857em',
                textTransform: 'none',
            },
            caption: {
                fontWeight: 400,
                fontSize: '0.75rem',
                lineHeight: 1.66,
                letterSpacing: '0.03333em',
            },
            overline: {
                fontWeight: 400,
                fontSize: '0.75rem',
                lineHeight: 2.66,
                letterSpacing: '0.08333em',
                textTransform: 'uppercase',
            },
        },
        shape: {
            borderRadius: 10, // Slightly increased
        },
        shadows: [
            'none',
            '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
            '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
            '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
            '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
            '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
            '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
            '0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)',
            '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
            '0px 5px 6px -3px rgba(0,0,0,0.2), 0px 9px 12px 1px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)',
            '0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)',
            '0px 6px 7px -4px rgba(0,0,0,0.2), 0px 11px 15px 1px rgba(0,0,0,0.14), 0px 4px 20px 3px rgba(0,0,0,0.12)',
            '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)',
            '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 13px 19px 2px rgba(0,0,0,0.14), 0px 5px 24px 4px rgba(0,0,0,0.12)',
            '0px 7px 9px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 26px 4px rgba(0,0,0,0.12)',
            '0px 8px 9px -5px rgba(0,0,0,0.2), 0px 15px 22px 2px rgba(0,0,0,0.14), 0px 6px 28px 5px rgba(0,0,0,0.12)',
            '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
            '0px 8px 11px -5px rgba(0,0,0,0.2), 0px 17px 26px 2px rgba(0,0,0,0.14), 0px 6px 32px 5px rgba(0,0,0,0.12)',
            '0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)',
            '0px 9px 12px -6px rgba(0,0,0,0.2), 0px 19px 29px 2px rgba(0,0,0,0.14), 0px 7px 36px 6px rgba(0,0,0,0.12)',
            '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 20px 31px 3px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)',
            '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 21px 33px 3px rgba(0,0,0,0.14), 0px 8px 40px 7px rgba(0,0,0,0.12)',
            '0px 10px 14px -6px rgba(0,0,0,0.2), 0px 22px 35px 3px rgba(0,0,0,0.14), 0px 8px 42px 7px rgba(0,0,0,0.12)',
            '0px 11px 14px -7px rgba(0,0,0,0.2), 0px 23px 36px 3px rgba(0,0,0,0.14), 0px 9px 44px 8px rgba(0,0,0,0.12)',
            '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
        ],
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarColor: "#6b6b6b #2b2b2b",
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                            backgroundColor: "#2b2b2b",
                            width: "8px",
                            height: "8px",
                        },
                        "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                            borderRadius: 8,
                            backgroundColor: "#6b6b6b",
                            border: "2px solid #2b2b2b",
                            minHeight: 40,
                        },
                        "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                            backgroundColor: "#959595",
                        },
                        "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                            backgroundColor: "#959595",
                        },
                        "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: "#959595",
                        },
                        "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                            backgroundColor: "#2b2b2b",
                        },
                        overflowY: "overlay", // Better scrolling behavior
                    },
                    // Add support for .mui-fixed class to handle fixed positioned elements when modals are open
                    '.mui-fixed': {
                        position: 'fixed',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                        background: 'linear-gradient(90deg, #15152a 0%, #1d1d35 100%)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        boxShadow: 'none',
                        fontWeight: 500,
                        padding: '8px 16px',
                        transition: 'all 0.2s ease-in-out',
                        borderRadius: 8,
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        },
                        '&.Mui-disabled': {
                            opacity: 0.6,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.4)',
                        },
                    },
                    contained: {
                        '&.MuiButton-containedPrimary': {
                            background: 'linear-gradient(45deg, #3a7af4 30%, #5294ff 90%)',
                            boxShadow: '0 4px 12px rgba(58, 122, 244, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #306ae4 30%, #3f7fe6 90%)',
                                boxShadow: '0 6px 16px rgba(58, 122, 244, 0.4)',
                            },
                        },
                        '&.MuiButton-containedSecondary': {
                            background: 'linear-gradient(45deg, #9067ff 30%, #a985ff 90%)',
                            boxShadow: '0 4px 12px rgba(144, 103, 255, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #8454ff 30%, #9570f5 90%)',
                                boxShadow: '0 6px 16px rgba(144, 103, 255, 0.4)',
                            },
                        },
                    },
                    outlined: {
                        borderWidth: '1.5px',
                        '&:hover': {
                            borderWidth: '1.5px',
                        },
                        '&.MuiButton-outlinedPrimary': {
                            borderColor: '#4a8cff',
                            '&:hover': {
                                backgroundColor: 'rgba(74, 140, 255, 0.08)',
                            },
                        },
                        '&.MuiButton-outlinedSecondary': {
                            borderColor: '#9f75ff',
                            '&:hover': {
                                backgroundColor: 'rgba(159, 117, 255, 0.08)',
                            },
                        },
                    },
                    text: {
                        '&.MuiButton-textPrimary': {
                            '&:hover': {
                                backgroundColor: 'rgba(74, 140, 255, 0.08)',
                            },
                        },
                        '&.MuiButton-textSecondary': {
                            '&:hover': {
                                backgroundColor: 'rgba(159, 117, 255, 0.08)',
                            },
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        borderRadius: 12,
                        '&.MuiPaper-outlined': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: '#1c1c2c',
                        background: 'linear-gradient(145deg, #1e1e30 0%, #252538 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        overflow: 'visible',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '&:hover': {
                            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
                            transform: 'translateY(-4px)',
                        },
                    },
                },
            },
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        padding: '24px',
                        '&:last-child': {
                            paddingBottom: '24px',
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(25, 25, 40, 0.6)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 8,
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: 'rgba(30, 30, 50, 0.8)',
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'rgba(35, 35, 60, 0.9)',
                                boxShadow: '0 0 0 3px rgba(74, 140, 255, 0.2)',
                            },
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                borderWidth: '1.5px',
                                transition: 'border-color 0.2s',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.25)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkPalette.primary.main,
                                borderWidth: '2px',
                            },
                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkPalette.error.main,
                            },
                            '& .MuiInputBase-input': {
                                padding: '14px 16px',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500,
                            '&.Mui-focused': {
                                color: darkPalette.primary.light,
                            },
                            '&.Mui-error': {
                                color: darkPalette.error.main,
                            },
                        },
                        '& .MuiInputBase-input': {
                            '&::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)',
                                opacity: 1,
                            },
                        },
                    },
                },
            },
            MuiFormHelperText: {
                styleOverrides: {
                    root: {
                        marginLeft: 0,
                        '&.Mui-error': {
                            color: alpha(darkPalette.error.main, 0.9),
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    icon: {
                        color: darkPalette.text.secondary,
                    },
                    select: {
                        padding: '14px 16px',
                    }
                },
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        border: `1px solid ${darkPalette.divider}`,
                        color: darkPalette.text.secondary,
                        borderRadius: 8,
                        padding: '8px 16px',
                        '&.Mui-selected': {
                            backgroundColor: alpha(darkPalette.primary.main, 0.2),
                            color: darkPalette.primary.light,
                            fontWeight: 500,
                            '&:hover': {
                                backgroundColor: alpha(darkPalette.primary.main, 0.25),
                            },
                        },
                        '&:hover': {
                            backgroundColor: alpha(darkPalette.action.hover, 0.1),
                        },
                    },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    },
                    standardSuccess: {
                        backgroundColor: alpha(darkPalette.success.main, 0.15),
                        border: `1px solid ${alpha(darkPalette.success.main, 0.3)}`,
                        '& .MuiAlert-icon': {
                            color: darkPalette.success.main,
                        },
                    },
                    standardInfo: {
                        backgroundColor: alpha(darkPalette.info.main, 0.15),
                        border: `1px solid ${alpha(darkPalette.info.main, 0.3)}`,
                        '& .MuiAlert-icon': {
                            color: darkPalette.info.main,
                        },
                    },
                    standardWarning: {
                        backgroundColor: alpha(darkPalette.warning.main, 0.15),
                        border: `1px solid ${alpha(darkPalette.warning.main, 0.3)}`,
                        '& .MuiAlert-icon': {
                            color: darkPalette.warning.main,
                        },
                    },
                    standardError: {
                        backgroundColor: alpha(darkPalette.error.main, 0.15),
                        border: `1px solid ${alpha(darkPalette.error.main, 0.3)}`,
                        '& .MuiAlert-icon': {
                            color: darkPalette.error.main,
                        },
                    },
                },
            },
            MuiListItem: {
                styleOverrides: {
                    root: {
                        paddingTop: 8,
                        paddingBottom: 8,
                        '&.Mui-selected': {
                            backgroundColor: alpha(darkPalette.primary.main, 0.15),
                            '&:hover': {
                                backgroundColor: alpha(darkPalette.primary.main, 0.2),
                            },
                        },
                    },
                },
            },
            MuiDivider: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 24, 0.95)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        padding: '8px 12px',
                        borderRadius: 6,
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        height: 28,
                        fontWeight: 500,
                        borderRadius: 6,
                    },
                    filled: {
                        '&.MuiChip-colorPrimary': {
                            backgroundColor: alpha(darkPalette.primary.main, 0.2),
                            color: darkPalette.primary.light,
                            border: `1px solid ${alpha(darkPalette.primary.main, 0.3)}`,
                        },
                        '&.MuiChip-colorSecondary': {
                            backgroundColor: alpha(darkPalette.secondary.main, 0.2),
                            color: darkPalette.secondary.light,
                            border: `1px solid ${alpha(darkPalette.secondary.main, 0.3)}`,
                        },
                        '&.MuiChip-colorSuccess': {
                            backgroundColor: alpha(darkPalette.success.main, 0.2),
                            color: darkPalette.success.light,
                            border: `1px solid ${alpha(darkPalette.success.main, 0.3)}`,
                        },
                        '&.MuiChip-colorError': {
                            backgroundColor: alpha(darkPalette.error.main, 0.2),
                            color: darkPalette.error.light,
                            border: `1px solid ${alpha(darkPalette.error.main, 0.3)}`,
                        },
                        '&.MuiChip-colorInfo': {
                            backgroundColor: alpha(darkPalette.info.main, 0.2),
                            color: darkPalette.info.light,
                            border: `1px solid ${alpha(darkPalette.info.main, 0.3)}`,
                        },
                        '&.MuiChip-colorWarning': {
                            backgroundColor: alpha(darkPalette.warning.main, 0.2),
                            color: darkPalette.warning.light,
                            border: `1px solid ${alpha(darkPalette.warning.main, 0.3)}`,
                        },
                    },
                },
            },
            MuiStepper: {
                styleOverrides: {
                    root: {
                        padding: '0.5rem 0',
                    },
                },
            },
            MuiStepLabel: {
                styleOverrides: {
                    root: {
                        padding: '0 8px',
                    },
                    label: {
                        fontSize: '0.8rem',
                        marginTop: '4px',
                    },
                },
            },
            MuiStepIcon: {
                styleOverrides: {
                    root: {
                        fontSize: 22,
                        '&.Mui-completed': {
                            color: darkPalette.primary.main,
                        },
                    },
                },
            },
            MuiStepConnector: {
                styleOverrides: {
                    line: {
                        minHeight: 1,
                        borderColor: alpha(darkPalette.divider, 0.6),
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    root: {
                        '.MuiBackdrop-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                    },
                    paper: {
                        borderRadius: 12,
                        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'linear-gradient(145deg, #1e1e30 0%, #252538 100%)',
                        overflow: 'hidden',
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: {
                        padding: '20px 24px',
                        maxHeight: '70vh',
                        '&.MuiDialogContent-dividers': {
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            padding: '20px 24px',
                        },
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            borderRadius: 8,
                            backgroundColor: 'rgba(107, 107, 107, 0.7)',
                            minHeight: 40,
                        },
                    },
                },
            },
        },
    });

    return theme;
}; 