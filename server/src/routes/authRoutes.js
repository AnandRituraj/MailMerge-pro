/**
 * @file authRoutes.js
 * @description Authentication-related route definitions.
 * 
 * This file defines all authentication-related API endpoints including:
 * - AI mode access validation
 * - User authentication endpoints
 * 
 * Routes defined here are mounted under the /api/auth prefix
 * and map to controller functions that handle the business logic.
 */

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// AI mode authentication endpoint
router.post('/validate-ai-access', authController.validateAIAccess);

export default router; 