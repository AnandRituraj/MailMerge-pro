/**
 * @file routes/index.js
 * @description Main router configuration for the application API.
 * 
 * This file:
 * - Acts as the central router for all API endpoints
 * - Imports and organizes feature-specific route modules
 * - Mounts each route module with its appropriate prefix
 * - Provides a clean, organized structure for all API routes
 * 
 * All API routes are mounted under the /api prefix in the main application.
 */

import express from 'express';
import authRoutes from './authRoutes.js';
import emailRoutes from './emailRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

// Mount all routes with appropriate prefixes
router.use('/auth', authRoutes);
router.use('/email', emailRoutes);
router.use('/resume', resumeRoutes);
router.use('/ai', aiRoutes);

export default router; 