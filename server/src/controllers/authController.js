/**
 * @file authController.js
 * @description Authentication controller for the application.
 * 
 * This controller handles:
 * - Authentication logic for accessing protected features
 * - AI mode access validation
 * - Security measures for authentication processes
 * 
 * The controller implements proper error handling, input validation,
 * and security best practices for authentication operations.
 */

import config from '../config/config.js';

/**
 * Validate AI mode access with password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function validateAIAccess(req, res) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Check if AI_MODE_PASSWORD is set in environment variables
        if (!config.aiModePassword) {
            return res.status(503).json({
                success: false,
                message: 'AI mode is not configured properly. Please contact the administrator.'
            });
        }

        // Password validation
        if (password === config.aiModePassword) {
            return res.status(200).json({
                success: true,
                message: 'Authentication successful'
            });
        } else {
            // Add delay to prevent brute force attacks
            await new Promise(resolve => setTimeout(resolve, 1000));

            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Please try again.'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
} 