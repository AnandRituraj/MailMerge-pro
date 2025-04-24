/**
 * @file emailService.js
 * @description Email service for handling all email operations.
 * 
 * This service handles:
 * - Email transporter creation and configuration
 * - SMTP connection testing
 * - Bulk email sending with personalization
 * - Email content formatting and template processing
 * - Support for multiple email services (Gmail, Outlook)
 * - Attachment handling and formatting
 * 
 * The service implements proper error handling, email validation,
 * and secure email sending protocols. It supports personalized emails,
 * HTML formatting, and multiple recipient handling.
 */

import nodemailer from 'nodemailer';

/**
 * Create an email transporter based on service type
 * @param {Object} emailConfig - Email configuration
 * @param {string} emailConfig.email - Email address
 * @param {string} emailConfig.password - Email password
 * @param {string} emailConfig.service - Email service (gmail, outlook, etc.)
 * @returns {Object} - Nodemailer transporter
 */
export function createTransporter(emailConfig) {
    const { email, password, service } = emailConfig;

    if (service.toLowerCase() === 'outlook') {
        return nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            port: 587,
            secure: false,
            auth: {
                user: email,
                pass: password,
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });
    } else {
        return nodemailer.createTransport({
            service: service,
            auth: {
                user: email,
                pass: password,
            },
        });
    }
}

/**
 * Format email content with appropriate HTML and styling
 * @param {string} content - Raw email content
 * @param {string} name - Recipient name for personalization
 * @param {string} signature - Optional email signature
 * @returns {string} - Formatted HTML email
 */
export function formatEmailContent(content, name, signature = '') {
    // Replace placeholder with recipient name (wrapped in strong tags to make it bold)
    let formattedEmail = content.replace(/\{name\}/g, `<strong>${name}</strong>`);

    // Convert newlines to HTML line breaks
    formattedEmail = formattedEmail.replace(/\n/g, '<br>');

    // Convert URLs to clickable links
    formattedEmail = formattedEmail.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');

    // Add signature if provided
    if (signature) {
        formattedEmail += signature;
    }

    return formattedEmail;
}

/**
 * Format attachments for nodemailer
 * @param {Array} attachments - Array of attachment objects
 * @returns {Array} - Formatted attachments for nodemailer
 */
export function formatAttachments(attachments = []) {
    if (!attachments || !attachments.length) return [];

    try {
        return attachments.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
            encoding: attachment.encoding || 'base64'
        }));
    } catch (error) {
        console.error('Error formatting attachments:', error);
        // Return empty array if there's an error processing attachments
        return [];
    }
}

/**
 * Test email connection with provided credentials
 * @param {Object} config - Email configuration
 * @returns {Promise<Boolean>} - True if connection is successful
 */
export async function testEmailConnection(config) {
    const { email, password, service } = config;

    if (!email || !password || !service) {
        throw new Error('Missing email credentials');
    }

    const testTransporter = createTransporter(config);
    await testTransporter.verify();

    return true;
}

/**
 * Send emails to recipients
 * @param {Object} options - Email options
 * @param {Array} options.recipients - List of recipients
 * @param {string} options.emailTemplate - Email template
 * @param {string} options.subject - Email subject
 * @param {string} options.signature - Email signature
 * @param {Object} options.emailConfig - Email configuration
 * @param {Array} options.attachments - Email attachments
 * @returns {Promise<Array>} - Results of sending emails
 */
export async function sendEmails(options) {
    const { recipients, emailTemplate, subject, signature, emailConfig, attachments } = options;

    // Validate required fields
    if (!recipients || !emailTemplate || !subject || !emailConfig) {
        throw new Error('Missing required fields');
    }

    if (!emailConfig.email || !emailConfig.password || !emailConfig.service) {
        throw new Error('Missing email configuration');
    }

    // Create transporter with user-provided credentials
    const transporter = createTransporter(emailConfig);

    // Verify connection before sending emails
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
    } catch (error) {
        console.error('SMTP verification failed:', error);
        throw new Error(`SMTP connection failed: ${error.message}`);
    }

    // Process each recipient
    const results = [];
    for (const recipient of recipients) {
        try {
            const { name, email, emails = [], personalizedEmail, personalizedSubject } = recipient;

            // Get list of emails (either from emails array or from single email)
            const allEmails = emails.length > 0 ? emails : [email];

            // Skip if no valid emails
            if (allEmails.length === 0) {
                console.warn('Skipping recipient with no email address:', name);
                continue;
            }

            // Use the first email as the primary recipient
            const primaryEmail = allEmails[0];
            // Use any additional emails as BCC recipients
            const bccEmails = allEmails.slice(1);

            // Format email content with HTML and styling
            // Use personalized content if available, otherwise use the template
            const contentToFormat = personalizedEmail || emailTemplate;
            const emailSubject = personalizedSubject || subject;

            const personalizedEmailContent = formatEmailContent(contentToFormat, name, signature);

            // Log attachment details for debugging
            const formattedAttachments = formatAttachments(attachments);
            console.log(`Sending email to ${primaryEmail} with ${formattedAttachments.length} attachments`);

            // Prepare email data
            const mailOptions = {
                from: emailConfig.email,
                to: primaryEmail,
                ...(bccEmails.length > 0 && { bcc: bccEmails.join(', ') }),
                subject: emailSubject,
                html: personalizedEmailContent,
                attachments: formattedAttachments
            };

            // Send email with improved options for HTML content
            const info = await transporter.sendMail(mailOptions);

            console.log(`Email sent successfully to ${primaryEmail}, messageId: ${info.messageId}`);

            // Add result for primary email
            results.push({
                email: primaryEmail,
                status: 'sent',
                messageId: info.messageId,
                personalized: !!personalizedEmail
            });

            // Add results for BCC emails
            bccEmails.forEach(bccEmail => {
                results.push({
                    email: bccEmail,
                    status: 'sent (BCC)',
                    messageId: info.messageId,
                    personalized: !!personalizedEmail
                });
            });
        } catch (error) {
            console.error(`Failed to send email to recipient ${recipient.name || recipient.email}:`, error);

            // Add error result instead of throwing, to continue with other recipients
            results.push({
                email: recipient.email || (recipient.emails && recipient.emails[0]),
                status: 'error',
                error: error.message
            });
        }
    }

    return results;
} 