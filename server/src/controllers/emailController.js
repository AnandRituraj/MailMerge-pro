/**
 * @file emailController.js
 * @description Email processing controller for the application.
 * 
 * This controller handles:
 * - Email validation and testing of connection settings
 * - Sending emails with templates to multiple recipients
 * - Email configuration validation
 * - Processing of attachments and templates
 * 
 * The controller implements proper error handling, input validation,
 * and delegates actual email operations to the email service.
 */

import * as emailService from '../services/emailService.js';

/**
 * Test email connection with provided credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function testEmailConnection(req, res) {
    try {
        const { email, password, service } = req.body;

        await emailService.testEmailConnection({ email, password, service });

        res.status(200).json({
            success: true,
            message: 'Connection successful! Your email credentials are working.'
        });
    } catch (error) {
        console.error('Email connection test failed:', error);
        res.status(401).json({
            success: false,
            message: `Connection failed: ${error.message}`
        });
    }
}

/**
 * Send emails to recipients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function sendEmails(req, res) {
    try {
        const { recipients, emailTemplate, subject, signature, emailConfig, attachments } = req.body;

        // Detailed validation with specific error messages
        if (!recipients) {
            return res.status(400).json({
                success: false,
                message: 'No recipients specified'
            });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipients must be a non-empty array'
            });
        }

        if (!emailTemplate) {
            return res.status(400).json({
                success: false,
                message: 'Email template is required'
            });
        }

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: 'Email subject is required'
            });
        }

        if (!emailConfig) {
            return res.status(400).json({
                success: false,
                message: 'Email configuration is required'
            });
        }

        if (!emailConfig.email || !emailConfig.password || !emailConfig.service) {
            return res.status(400).json({
                success: false,
                message: 'Missing email configuration: email, password, and service are required'
            });
        }

        // Log data for debugging (without sensitive info)
        console.log(`Sending emails to ${recipients.length} recipients`);
        console.log(`Email configuration: ${emailConfig.email}, service: ${emailConfig.service}`);
        console.log(`Subject: ${subject}`);
        console.log(`Attachments: ${attachments ? attachments.length : 0}`);

        // Send emails with enhanced error handling
        const results = await emailService.sendEmails({
            recipients,
            emailTemplate,
            subject,
            signature,
            emailConfig,
            attachments
        });

        // Check if there were any errors in the results
        const errors = results.filter(result => result.status === 'error');
        if (errors.length > 0) {
            // Some emails failed but others may have succeeded
            if (errors.length < results.length) {
                return res.status(207).json({
                    success: true,
                    message: `Sent ${results.length - errors.length} emails, ${errors.length} failed`,
                    results,
                    partialFailure: true
                });
            } else {
                // All emails failed
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send all emails',
                    results,
                    errors: errors.map(err => err.error).join('; ')
                });
            }
        }

        // All emails sent successfully
        res.status(200).json({
            success: true,
            message: 'Emails sent successfully',
            results
        });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send emails',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
} 