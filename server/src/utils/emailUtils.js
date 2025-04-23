import nodemailer from 'nodemailer';

/**
 * Create an email transporter based on service type
 * @param {Object} emailConfig - Email configuration
 * @param {string} emailConfig.email - Email address
 * @param {string} emailConfig.password - Email password
 * @param {string} emailConfig.service - Email service (gmail, outlook, etc.)
 * @returns {Object} - Nodemailer transporter
 */
function createTransporter(emailConfig) {
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
function formatEmailContent(content, name, signature = '') {
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
function formatAttachments(attachments = []) {
    if (!attachments || !attachments.length) return [];

    return attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: attachment.encoding
    }));
}

/**
 * Test email connection with provided credentials
 * @param {Object} config - Email configuration
 * @returns {Promise<Boolean>} - True if connection is successful
 */
async function testEmailConnection(config) {
    const { email, password, service } = config;

    if (!email || !password || !service) {
        throw new Error('Missing email credentials');
    }

    const testTransporter = createTransporter(config);
    await testTransporter.verify();

    return true;
}

export default {
    createTransporter,
    formatEmailContent,
    formatAttachments,
    testEmailConnection
}; 