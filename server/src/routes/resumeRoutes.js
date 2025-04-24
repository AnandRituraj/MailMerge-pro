/**
 * @file resumeRoutes.js
 * @description Resume processing route definitions.
 * 
 * This file defines all resume-related API endpoints including:
 * - Resume file uploads
 * - Resume parsing and analysis
 * - Email generation based on resume content
 * 
 * Routes defined here are mounted under the /api/resume prefix,
 * use file upload middleware, and map to controller functions
 * that handle the business logic.
 */

import express from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { upload } from '../services/fileService.js';

const router = express.Router();

// Resume upload endpoint
router.post('/upload-resume', upload.single('resume'), resumeController.uploadResume);

// Generate email with resume upload
router.post('/generate-email-with-resume', upload.single('resumeFile'), resumeController.generateEmailWithResume);

export default router; 