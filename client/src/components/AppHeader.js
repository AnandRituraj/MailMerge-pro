import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const AppHeader = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar
            position="static"
            className="mui-fixed"
            sx={{
                mb: 1,
                py: 0.5,
                background: 'rgba(20, 20, 35, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
        >
            <Toolbar variant="dense">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlineIcon
                        sx={{
                            mr: 1,
                            color: theme.palette.primary.main,
                            fontSize: isMobile ? 20 : 24
                        }}
                    />
                    <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textFillColor: 'transparent'
                        }}
                    >
                        MailMerge Pro
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Box>
                    <Tooltip title="Help">
                        <IconButton
                            color="inherit"
                            size="small"
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AppHeader; 