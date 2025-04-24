/**
 * @file index.js
 * @description Main entry point for the MailMerge Pro server application.
 * 
 * This file initializes the Express server, configures middleware,
 * sets up API routes, and starts the server. It handles:
 * - Server configuration and initialization
 * - Middleware setup (CORS, JSON parsing)
 * - API route mounting
 * - Server health check endpoint
 * - Creation of required directories
 */

import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import config from './config/config.js';
import { corsMiddleware, handleOptions } from './middleware/corsMiddleware.js';
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = config.port;

// Make sure uploads directory exists
if (!fs.existsSync(config.paths.uploadsDir)) {
	fs.mkdirSync(config.paths.uploadsDir, { recursive: true });
}

// Apply CORS middleware
app.use(corsMiddleware);

// Handle preflight requests
app.options('*', handleOptions);

// Parse JSON bodies with increased limit
app.use(express.json({ limit: '50mb' }));

// Mount API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'Server is running'
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});