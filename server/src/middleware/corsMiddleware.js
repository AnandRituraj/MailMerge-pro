/**
 * @file corsMiddleware.js
 * @description CORS (Cross-Origin Resource Sharing) configuration for the application.
 * 
 * This middleware handles:
 * - Setting up CORS policy based on application configuration
 * - Managing allowed origins, methods, and headers
 * - Processing preflight requests (OPTIONS)
 * - Ensuring secure cross-origin communication
 * 
 * The configuration is loaded from the central config file and
 * exports both the CORS middleware and a dedicated OPTIONS handler.
 */

import cors from 'cors';
import config from '../config/config.js';

// CORS configuration with preflight support
const corsOptions = {
    origin: config.cors.origins,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: config.cors.credentials,
    preflightContinue: config.cors.preflightContinue,
    optionsSuccessStatus: config.cors.optionsSuccessStatus
};

// Apply CORS middleware
export const corsMiddleware = cors(corsOptions);

// Handle preflight requests explicitly
export const handleOptions = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
}; 