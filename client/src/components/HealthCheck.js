import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import config from '../config';

const HealthCheck = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [serverInfo, setServerInfo] = useState(null);

    const checkHealth = async () => {
        setStatus('loading');
        setMessage('Checking server health...');

        try {
            // Check server health endpoint
            const healthResponse = await fetch(`${config.API_URL}/api/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                setStatus('success');
                setMessage(`Server health: ${healthData.status}`);
            } else {
                setStatus('error');
                setMessage(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
            }

            // Test the general test endpoint
            const testResponse = await fetch(`${config.API_URL}/api/test`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (testResponse.ok) {
                const testData = await testResponse.json();
                setServerInfo(testData);
            }
        } catch (error) {
            console.error('Health check error:', error);
            setStatus('error');
            setMessage(`Error connecting to server: ${error.message}`);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Server Health Check
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
                <Typography variant="body2">
                    This page checks connectivity to your backend server.
                </Typography>
            </Paper>

            <Alert
                severity={status === 'loading' ? 'info' : status === 'success' ? 'success' : 'error'}
                sx={{ mb: 2 }}
            >
                {message}
            </Alert>

            <Button
                variant="contained"
                color="primary"
                onClick={checkHealth}
                sx={{ mb: 3 }}
            >
                Refresh Health Check
            </Button>

            {serverInfo && (
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Server Info:
                    </Typography>
                    <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
                        {JSON.stringify(serverInfo, null, 2)}
                    </pre>
                </Paper>
            )}

            <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Current Configuration:
                </Typography>
                <pre>
                    {`API_URL: ${config.API_URL}
NODE_ENV: ${process.env.NODE_ENV}`}
                </pre>
            </Box>
        </Box>
    );
};

export default HealthCheck; 