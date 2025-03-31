const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with specific CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',                // Local development
        'https://mailmerge-pro.vercel.app',     // Primary Vercel domain
        /\.vercel\.app$/                        // Any Vercel subdomain
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Email testing endpoint
app.post('/api/test-email-connection', async (req, res) => {
    try {
        const { email, password, service } = req.body;

        if (!email || !password || !service) {
            return res.status(400).json({
                success: false,
                message: 'Missing email credentials'
            });
        }

        // Create test transporter
        let testTransporter;
        if (service.toLowerCase() === 'outlook') {
            testTransporter = nodemailer.createTransport({
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
            testTransporter = nodemailer.createTransport({
                service: service,
                auth: {
                    user: email,
                    pass: password,
                },
            });
        }

        // Verify connection configuration
        await testTransporter.verify();

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
});

// Email sending endpoint
app.post('/api/send-emails', async (req, res) => {
    try {
        const { recipients, emailTemplate, subject, signature, emailConfig, attachments } = req.body;

        if (!recipients || !emailTemplate || !subject || !emailConfig) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!emailConfig.email || !emailConfig.password || !emailConfig.service) {
            return res.status(400).json({
                success: false,
                message: 'Missing email configuration'
            });
        }

        // Create transporter with user-provided credentials
        let transporter;
        if (emailConfig.service.toLowerCase() === 'outlook') {
            transporter = nodemailer.createTransport({
                host: "smtp-mail.outlook.com",
                port: 587,
                secure: false,
                auth: {
                    user: emailConfig.email,
                    pass: emailConfig.password,
                },
                tls: {
                    ciphers: 'SSLv3'
                }
            });
        } else {
            transporter = nodemailer.createTransport({
                service: emailConfig.service,
                auth: {
                    user: emailConfig.email,
                    pass: emailConfig.password,
                },
            });
        }

        // Process each recipient
        const results = [];
        for (const recipient of recipients) {
            const { name, email } = recipient;

            // Replace placeholder with recipient name
            let personalizedEmail = emailTemplate.replace(/\{name\}/g, name);

            // Convert newlines to HTML line breaks
            personalizedEmail = personalizedEmail.replace(/\n/g, '<br>');

            // Add signature if provided
            if (signature) {
                personalizedEmail += signature;
            }

            // Prepare email data
            const mailOptions = {
                from: emailConfig.email,
                to: email,
                subject,
                html: personalizedEmail,
                attachments: attachments || [] // Use provided attachments or empty array
            };

            // Send email with improved options for HTML content
            const info = await transporter.sendMail(mailOptions);

            results.push({
                email,
                status: 'sent',
                messageId: info.messageId,
            });
        }

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
            error: error.message
        });
    }
});

// Server health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});