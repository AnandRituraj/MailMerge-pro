/**
 * @file emailRoutes.js
 * @description Email processing and sending route definitions.
 * 
 * This file defines all email-related API endpoints including:
 * - Testing email connection settings
 * - Sending bulk emails with mail merge functionality
 * 
 * Routes defined here are mounted under the /api/email prefix
 * and map to controller functions that handle the business logic.
 */

import express from 'express';
import * as emailController from '../controllers/emailController.js';

const router = express.Router();

// Email test endpoint
router.post('/test-email-connection', emailController.testEmailConnection);

// Email sending endpoint
router.post('/send-emails', emailController.sendEmails);

export default router; 