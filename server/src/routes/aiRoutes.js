/**
 * @file aiRoutes.js
 * @description AI processing and generation route definitions.
 * 
 * This file defines all AI-related API endpoints including:
 * - AI-powered email generation
 * - Content optimization and analysis
 * 
 * Routes defined here are mounted under the /api/ai prefix
 * and map to controller functions that handle AI processing logic.
 */

import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

// AI email generation endpoint (text-based resume)
router.post('/generate-email', aiController.generateEmail);

export default router; 