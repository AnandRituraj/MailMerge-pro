# MailMerge Pro

A professional web application for sending personalized emails to multiple recipients, with an AI-powered mode specifically designed for job applications. The app allows you to create email templates with dynamic placeholders and automatically sends customized emails to each recipient.

## Live Demo

The application is now deployed and available online:

- **Frontend**: https://mailmerge-pro.vercel.app/ (This is the only URL you need to access the application)
- **Backend**: Hosted on Render (not directly accessible - used by the frontend)

## Features

### Standard Email Mode

- Add recipients individually or upload CSV/JSON file with recipient information
- Create email templates with dynamic placeholders (`{name}`)
- Add multiple email addresses per recipient (first as main recipient, others as BCC)
- Set up plain text or HTML email signatures
- Auto-formatting of URLs and email addresses into clickable links
- Add file attachments to your email campaigns (up to 10MB per file)
- Preview emails before sending
- Send personalized emails to multiple recipients
- View sending results and delivery status

### AI Job Application Mode

- Upload potential employer information (name, email, job description, company profile)
- Generate personalized cold emails using OpenAI's language models
- Upload and process PDF resumes to extract text for personalization
- Send tailored emails to recruiters that highlight your relevant skills
- Password protection to control access to AI features

### General Features

- Fully responsive design that works on mobile, tablet, and desktop
- Modern, accessible UI with improved keyboard navigation
- Secure: email credentials are never stored on the server

## Technology Stack

- **Frontend**:
  - React 18
  - Material UI v5
  - Responsive design with flexbox layouts
  - Axios for API requests
- **Backend**:
  - Node.js
  - Express
  - Nodemailer for email sending
  - OpenAI API for AI email generation
  - PDF parsing for resume extraction
  - CORS for cross-origin support

## Project Structure

```
mailmerge-pro/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   ├── src/              # Source files
│   │   ├── components/   # React components
│   │   ├── App.js        # Main application component
│   │   ├── index.js      # Entry point
│   │   ├── theme.js      # Theme configuration
│   │   └── config.js     # Application configuration
│   └── package.json      # Frontend dependencies
│
├── server/               # Backend Node.js application
│   ├── src/              # Source files
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   │   ├── emailService.js  # Email sending service
│   │   │   ├── fileService.js   # File handling utilities
│   │   │   ├── openaiService.js # Re-exports from openai folder
│   │   │   └── openai/          # OpenAI service components
│   │   │       ├── client.js    # OpenAI client initialization
│   │   │       ├── index.js     # Main entry point
│   │   │       ├── parser.js    # Response parsing
│   │   │       └── prompts.js   # Prompt templates
│   │   └── index.js      # Express server entry point
│   └── package.json      # Backend dependencies
│
├── uploads/              # Temporary storage for uploaded files
└── .gitignore            # Git ignore file
```

## Local Development

If you want to run the application locally instead of using the deployed version, follow these steps:

### Prerequisites

- Node.js (v14+) and npm installed
- Email account (Gmail or Outlook) for sending emails
- OpenAI API key (for AI mode)

### Setup Instructions

1. Clone this repository
2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables:

   - Create a `server/.env` file with the following:

   ```
   PORT=5001
   OPENAI_API_KEY=your_openai_api_key_here
   AI_MODE_PASSWORD=your_secure_password_here
   ```

4. Start the development servers:

```bash
# Start the backend server (from the server directory)
cd server
npm run dev

# Start the frontend development server (from the client directory)
cd ../client
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Standard Mode

1. **Configure Email Account**:

   - Select your email service (Gmail, Outlook, Yahoo, Hotmail)
   - Enter your email address and password
   - For Gmail, you must use an App Password (see below)
   - Test the connection to verify credentials

2. **Add Recipients**:

   - Enter name and email manually and click "Add Recipient"
   - Add multiple email addresses per recipient by separating with commas
   - Upload a CSV file with format: `name,email` (one per line)
   - Upload a JSON file with format: `[{"name": "Name", "email": "email@example.com"}, ...]`

3. **Create Email Template**:

   - Enter the email subject
   - Write your email template using `{name}` as a placeholder for recipient names
   - Add URLs or email addresses that will automatically become clickable links
   - Add a signature (plain text or HTML) with the toggle switch
   - Add file attachments as needed
   - Preview how your email will look for each recipient

4. **Review and Send**:

   - Check your email template and recipient list
   - Review attachments if added
   - Click "Send Emails" to send personalized emails to all recipients

5. **View Results**:
   - See which emails were sent successfully
   - Option to start over and send more emails

### AI Job Application Mode

1. **Configure Email Account**:

   - Same as standard mode

2. **Upload Targets**:

   - Enter job information manually (name, email, job description, company profile)
   - Or upload a CSV/JSON file with columns for name, email, jobDescription, and companyProfile
   - Enter your resume text or upload a PDF resume (max 5MB)

3. **Generate AI Email**:

   - Select a recipient from the list
   - Click "Generate Email" to create a personalized job application email
   - Verify and edit the generated email and subject if needed
   - Add attachments (your resume, cover letter, etc.)

4. **Review and Send**:

   - Check your AI-generated emails
   - Review attachments
   - Click "Send Emails" to send your job applications

5. **View Results**:
   - See which emails were sent successfully
   - Option to start over and send more applications

## Multiple Email Addresses and BCC Recipients

MailMerge Pro supports sending to multiple email addresses per recipient:

- When adding multiple emails for one recipient, separate them with commas or semicolons
- The first email in the list will be the primary recipient
- Additional emails will be added as BCC recipients
- This is useful for sending to people who have multiple email addresses or when you need to include additional stakeholders

## Email Signatures

You can add signatures to your emails in two formats:

- **Plain Text**: Enter plain text that will maintain your formatting, with automatic link detection
- **HTML**: Paste HTML code for more complex signatures with images and formatting

## Gmail Setup for Sending Emails

To send emails using your Gmail account, you'll need to create an App Password:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security**
3. Under "Signing in to Google," select **2-Step Verification** (must be enabled)
4. At the bottom of the page, select **App passwords**
5. Select **Mail** as the app and **Other** as the device (name it "MailMerge Pro")
6. Click **Generate**
7. Use the generated 16-character code as your password in the MailMerge Pro app

## Deployment

The application is deployed using:

- **Frontend**: [Vercel](https://vercel.com) - Provides continuous deployment from the main branch
- **Backend**: [Render](https://render.com) - Hosts the Node.js server

### Deployment Configuration

- The frontend and backend are deployed separately
- CORS is configured to allow communication between the frontend (Vercel) and backend (Render)
- Required environment variables for Render:
  - `PORT` - Port for the server to run on (default: 5000)
  - `OPENAI_API_KEY` - Your OpenAI API key for AI mode
  - `AI_MODE_PASSWORD` - Password to access AI mode

## Security

This application prioritizes security by:

- Never storing email credentials on the server
- Using email credentials only for the current session
- Passing credentials securely via HTTPS
- Not saving sent emails or their content
- Temporarily processing and immediately deleting uploaded PDF resumes
- Password-protecting access to the AI features

## AI Mode Authentication

The AI mode is password-protected to control access to this feature:

1. When switching to AI mode, users will be prompted to enter a password
2. For security, the password must be set in your server's environment variables:
   ```
   AI_MODE_PASSWORD=your_secure_password_here
   ```
3. The password is validated server-side for enhanced security
4. If no password is set in the environment variables, AI mode will be unavailable

## Setting Up OpenAI Integration

To use the AI features, you'll need an OpenAI API key:

1. Sign up or log in at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys and create a new secret key
3. Add the key to your environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## PDF Resume Support

The application supports uploading PDF resumes:

1. Toggle the "Upload resume as PDF" switch in the AI Email Generator
2. Select your resume file (PDF format only, max 5MB)
3. The system will automatically extract text from your resume
4. This extracted text will be used to generate a personalized email

The PDF processing happens server-side for enhanced security. Your uploaded resume will be:

- Processed to extract the text content
- Used to generate the email
- Automatically deleted after processing

## Troubleshooting

### Email Connection Issues

- **Gmail Users**: Make sure you're using an App Password, not your regular password
- **Authentication Failed**: Double-check your email and password
- **Less Secure Apps**: For some email providers, you may need to enable "Less Secure Apps" access
- **Connection Timeout**: The email server might be temporarily unavailable, try again later
- **Outlook SMTP Issues**: Microsoft Outlook users may experience "Invalid login" errors. This is often due to Microsoft's security policies. Try the following:
  - Use an App Password instead of your regular password
  - Ensure your account has 2FA enabled, then generate an app password
  - Go to https://account.live.com/proofs/Manage and enable "App passwords"
  - If still having issues, try enabling "Less secure app access" temporarily
  - As a last resort, try using a different email provider for sending

### Application Issues

- **Backend Connection Failed**: The backend server might be in sleep mode (free tier on Render). The first request may take a few seconds to wake it up.
- **File Upload Issues**: Make sure CSV files are properly formatted with the required columns
- **PDF Processing Errors**: Ensure your PDF is not password-protected and contains selectable text
- **AI Mode Access**: If you cannot access AI mode, ensure the password is correctly set in environment variables
- **OpenAI Errors**: Check that your API key is valid and has sufficient credits
