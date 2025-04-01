# MailMerge Pro

A professional web application for sending personalized emails to multiple recipients. The app allows you to create email templates with dynamic placeholders and automatically sends customized emails to each recipient.

## Live Demo

The application is now deployed and available online:

- **Frontend**: https://mailmerge-pro.vercel.app/
- **Backend**: Hosted on Render

## Features

- Add recipients individually or upload CSV/JSON file with recipient information
- Create email templates with dynamic placeholders (`{name}`)
- Add multiple email addresses per recipient (first as main recipient, others as BCC)
- Set up plain text or HTML email signatures
- Auto-formatting of URLs and email addresses into clickable links
- Add file attachments to your email campaigns (up to 10MB per file)
- Preview emails before sending
- Send personalized emails to multiple recipients
- View sending results and delivery status
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
  - CORS for cross-origin support

## Project Structure

```
mailmerge-pro/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   ├── src/              # Source files
│   │   ├── components/   # React components
│   │   ├── App.js        # Main application component
│   │   └── index.js      # Entry point
│   └── package.json      # Frontend dependencies
│
├── server/               # Backend Node.js application
│   ├── src/              # Source files
│   │   └── index.js      # Express server and API endpoints
│   ├── .env              # Environment variables for port config (not in repo)
│   └── package.json      # Backend dependencies
│
└── .gitignore            # Git ignore file
```

## Local Development

If you want to run the application locally instead of using the deployed version, follow these steps:

### Prerequisites

- Node.js (v14+) and npm installed
- Email account (Gmail or Outlook) for sending emails

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

3. Configure server port (optional):

   - By default, the server runs on port 5000
   - To change the port, create a `server/.env` file with:

   ```
   PORT=5001
   ```

   - Make sure the "proxy" field in `client/package.json` matches this port

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

## Multiple Email Addresses and BCC Recipients

MailMerge Pro supports sending to multiple email addresses per recipient:

- When adding multiple emails for one recipient, separate them with commas or semicolons
- The first email in the list will be the primary recipient
- Additional emails will be added as BCC recipients
- This is useful for sending to people who have multiple email addresses or when you need to include additional stakeholders

## Email Signatures

You can now add signatures to your emails in two formats:

- **Plain Text**: Enter plain text that will maintain your formatting, with automatic link detection
- **HTML**: Paste HTML code for more complex signatures with images and formatting

## Device Compatibility

The application is fully responsive and works on:

- **Desktop computers**: Optimized layout with side-by-side form elements
- **Tablets**: Adaptive layout that adjusts to screen width
- **Mobile phones**: Stacked layout for easy reading and interaction on small screens

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
- CORS is configured to allow communication between the two services
- The frontend is configured to connect to the backend using environment variables

## Security

This application prioritizes security by:

- Never storing email credentials on the server
- Using email credentials only for the current session
- Passing credentials securely via HTTPS
- Not saving sent emails or their content

## Development

### Frontend

The client is built with React and uses Material UI for the user interface. The proxy is configured to forward API requests to the backend server running on port 5001.

### Backend

The server is built with Express and uses Nodemailer to send emails. It exposes API endpoints for sending emails and parsing recipient data.

### Environment Variables

For local development, the server uses only one environment variable:

- `PORT`: The port on which the server runs (default: 5000)

For the deployed version:

- The backend service on Render is configured with the appropriate environment variables
- The frontend on Vercel uses build-time configuration to connect to the backend

## Troubleshooting

### Email Connection Issues

- **Gmail Users**: Make sure you're using an App Password, not your regular password
- **Authentication Failed**: Double-check your email and password
- **Less Secure Apps**: For some email providers, you may need to enable "Less Secure Apps" access
- **Connection Timeout**: The email server might be temporarily unavailable, try again later

### Application Issues

- **Backend Connection Failed**: The backend server might be in sleep mode (free tier on Render). The first request may take a few seconds to wake it up.
- **File Upload Issues**: Make sure CSV files are properly formatted with "name,email" on each line
- **Browser Compatibility**: The application works best on modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Display Issues**: If text appears too small on mobile, try using landscape orientation for better readability
