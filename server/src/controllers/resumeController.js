/**
 * @file resumeController.js
 * @description Resume processing controller for the application.
 * 
 * This controller handles:
 * - Resume file uploads and parsing
 * - Text extraction from PDF documents
 * - Email generation based on resume content
 * - Processing job application details
 * 
 * The controller implements proper file handling, cleanup procedures,
 * input validation, and integrates with OpenAI services for content generation.
 */

import { upload, extractTextFromPDF, cleanupFile } from '../services/fileService.js';
import * as openaiService from '../services/openaiService.js';

/**
 * Upload and process a resume
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function uploadResume(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No resume file uploaded'
            });
        }

        const filePath = req.file.path;

        // Extract text from the PDF
        const resumeText = await extractTextFromPDF(filePath);

        // Clean up the file after processing
        cleanupFile(filePath);

        res.status(200).json({
            success: true,
            resumeText,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Error processing resume:', error);

        // If there was an uploaded file, clean it up
        if (req.file) {
            cleanupFile(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process resume',
            error: error.message
        });
    }
}

/**
 * Generate email with resume upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function generateEmailWithResume(req, res) {
    try {
        const { name, email, jobDescription, companyProfile } = req.body;

        if (!name || !email || !jobDescription || !companyProfile) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields for email generation'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No resume file uploaded'
            });
        }

        const filePath = req.file.path;

        // Get basic resume info (with pdf-lib we don't get the full text)
        const resumeInfo = await extractTextFromPDF(filePath);

        // Create resume text that acknowledges the PDF
        const resume = `
Resume uploaded as PDF file: ${req.file.originalname}
${resumeInfo}

Job Applicant Information:
- Name: ${name}
- Email: ${email}
- Applying for position based on provided job description
- Interested in company: ${companyProfile.substring(0, 100)}...
`;

        // Use the OpenAI service to generate the email
        const emailData = {
            name,
            email,
            jobDescription,
            companyProfile,
            resume
        };

        const generatedEmail = await openaiService.generateEmail(emailData);

        // Clean up the file after processing
        cleanupFile(filePath);

        res.status(200).json({
            success: true,
            emailContent: generatedEmail.emailContent,
            subject: generatedEmail.subject,
            pdfProcessed: true
        });
    } catch (error) {
        console.error('Error generating email with resume:', error);

        // If there was an uploaded file, clean it up
        if (req.file) {
            cleanupFile(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to generate email with resume',
            error: error.message
        });
    }
} 