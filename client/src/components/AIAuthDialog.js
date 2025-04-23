import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import config from '../config';

const AIAuthDialog = ({ open, onClose, onAuthenticate }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleAuthenticate = async () => {
        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        setIsAuthenticating(true);
        setError('');

        try {
            const response = await fetch(`${config.API_URL}/api/validate-ai-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onAuthenticate(true);
                onClose();
            } else {
                setError(data.message || 'Authentication failed. Please try again.');
            }
        } catch (error) {
            setError('Authentication service unavailable. Please try again later.');
            console.error('Authentication error:', error);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAuthenticate();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <LockIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">AI Mode Authentication</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    The AI Email Mode requires authentication. Please enter the password to continue.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    autoFocus
                    margin="dense"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isAuthenticating}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isAuthenticating}>Cancel</Button>
                <Button
                    onClick={handleAuthenticate}
                    variant="contained"
                    color="primary"
                    disabled={isAuthenticating}
                    startIcon={isAuthenticating ? <CircularProgress size={20} /> : null}
                >
                    {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AIAuthDialog; 