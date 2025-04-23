import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import openaiService from './utils/openaiService.js';
import emailUtils from './utils/emailUtils.js';
import { upload, extractTextFromPDF, cleanupFile } from './utils/fileUtils.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// AI mode password must be set in environment variables
const AI_MODE_PASSWORD = process.env.AI_MODE_PASSWORD;

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

// AI mode authentication endpoint
app.post('/api/validate-ai-access', async (req, res) => {
	try {
		const { password } = req.body;

		if (!password) {
			return res.status(400).json({
				success: false,
				message: 'Password is required'
			});
		}

		// Check if AI_MODE_PASSWORD is set in environment variables
		if (!AI_MODE_PASSWORD) {
			return res.status(503).json({
				success: false,
				message: 'AI mode is not configured properly. Please contact the administrator.'
			});
		}

		// Password validation
		if (password === AI_MODE_PASSWORD) {
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
});

// Email testing endpoint
app.post('/api/test-email-connection', async (req, res) => {
	try {
		const { email, password, service } = req.body;

		await emailUtils.testEmailConnection({ email, password, service });

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

// Resume upload endpoint
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
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
});

// AI email generation with PDF resume upload
app.post('/api/generate-email-with-resume', upload.single('resumeFile'), async (req, res) => {
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
		const transporter = emailUtils.createTransporter(emailConfig);

		// Process each recipient
		const results = [];
		for (const recipient of recipients) {
			const { name, email, emails = [], personalizedEmail, personalizedSubject } = recipient;

			// Get list of emails (either from emails array or from single email)
			const allEmails = emails.length > 0 ? emails : [email];

			// Skip if no valid emails
			if (allEmails.length === 0) continue;

			// Use the first email as the primary recipient
			const primaryEmail = allEmails[0];
			// Use any additional emails as BCC recipients
			const bccEmails = allEmails.slice(1);

			// Format email content with HTML and styling
			// Use personalized content if available, otherwise use the template
			const contentToFormat = personalizedEmail || emailTemplate;
			const emailSubject = personalizedSubject || subject;

			const personalizedEmailContent = emailUtils.formatEmailContent(contentToFormat, name, signature);

			// Prepare email data
			const mailOptions = {
				from: emailConfig.email,
				to: primaryEmail,
				...(bccEmails.length > 0 && { bcc: bccEmails.join(', ') }),
				subject: emailSubject,
				html: personalizedEmailContent,
				attachments: emailUtils.formatAttachments(attachments)
			};

			// Send email with improved options for HTML content
			const info = await transporter.sendMail(mailOptions);

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

// AI email generation endpoint (text-based resume)
app.post('/api/generate-email', async (req, res) => {
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
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});