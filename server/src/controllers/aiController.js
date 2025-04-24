/**
 * @file aiController.js
 * @description AI integration controller for the application.
 * 
 * This controller handles:
 * - AI-powered email generation from resumes
 * - Processing job application data for AI analysis
 * - Integration with OpenAI services
 * 
 * The controller implements input validation, error handling,
 * and delegates AI operations to the OpenAI service.
 */

import * as openaiService from '../services/openaiService.js';

/**
 * Generate email using AI with text-based resume
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function generateEmail(req, res) {
    try {
        const {
            name,
            email,
            jobDescription,
            companyProfile,
            resume
        } = req.body;

        if (!name || !email || !jobDescription || !companyProfile || !resume) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields for email generation'
            });
        }

        // Use the OpenAI service to generate the email
        const emailData = {
            name,
            email,
            jobDescription,
            companyProfile,
            resume
        };

        const generatedEmail = await openaiService.generateEmail(emailData);

        res.status(200).json({
            success: true,
            emailContent: generatedEmail.emailContent,
            subject: generatedEmail.subject
        });
    } catch (error) {
        console.error('Error generating email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate email',
            error: error.message
        });
    }
} 