const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration with preflight support
const corsOptions = {
	origin: [
		'http://localhost:3000',                // Local development
		'https://mailmerge-pro.vercel.app',     // Primary Vercel domain
		/\.vercel\.app$/                        // Any Vercel subdomain
	],
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	preflightContinue: false,
	optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' })); // Increased payload limit for attachments

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
			const { name, email, emails = [] } = recipient;

			// Get list of emails (either from emails array or from single email)
			const allEmails = emails.length > 0 ? emails : [email];

			// Skip if no valid emails
			if (allEmails.length === 0) continue;

			// Use the first email as the primary recipient
			const primaryEmail = allEmails[0];
			// Use any additional emails as BCC recipients
			const bccEmails = allEmails.slice(1);

			// Replace placeholder with recipient name (wrapped in strong tags to make it bold)
			let personalizedEmail = emailTemplate.replace(/\{name\}/g, `<strong>${name}</strong>`);

			// Convert newlines to HTML line breaks
			personalizedEmail = personalizedEmail.replace(/\n/g, '<br>');

			// Convert URLs to clickable links
			personalizedEmail = personalizedEmail.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');

			// Add signature if provided
			if (signature) {
				personalizedEmail += signature;
			}

			// Prepare email data
			const mailOptions = {
				from: emailConfig.email,
				to: primaryEmail,
				...(bccEmails.length > 0 && { bcc: bccEmails.join(', ') }),
				subject,
				html: personalizedEmail,
				attachments: attachments ? attachments.map(attachment => ({
					filename: attachment.filename,
					content: attachment.content,
					encoding: attachment.encoding
				})) : [] // Convert attachment format for nodemailer
			};

			// Send email with improved options for HTML content
			const info = await transporter.sendMail(mailOptions);

			// Add result for primary email
			results.push({
				email: primaryEmail,
				status: 'sent',
				messageId: info.messageId,
			});

			// Add results for BCC emails
			bccEmails.forEach(bccEmail => {
				results.push({
					email: bccEmail,
					status: 'sent (BCC)',
					messageId: info.messageId,
				});
			});
		}

		res.status(200).json({
			success: true,
			message: 'Emails sent successfully',
			results
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to send emails',
			error: error.message
		});
	}
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});