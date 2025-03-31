# MailMerge Pro

A professional web application for sending personalized emails to multiple recipients. The app allows you to create email templates with dynamic placeholders and automatically sends customized emails to each recipient.

## Features

- Add recipients individually or upload CSV/JSON file with recipient information
- Create email templates with dynamic placeholders (`{name}`)
- Preview emails before sending
- Send personalized emails to multiple recipients
- View sending results and delivery status
- Modern, responsive UI
- Secure: email credentials are never stored on the server

## Technology Stack

- **Frontend**:
  - React 18
  - Material UI v5
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

## Getting Started

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

1. **Add Recipients**:

   - Enter name and email manually and click "Add Recipient"
   - Or upload a CSV file with format: `name,email` (one per line)
   - Or upload a JSON file with format: `[{"name": "Name", "email": "email@example.com"}, ...]`

2. **Create Email Template**:

   - Enter the email subject
   - Write your email template using `{name}` as a placeholder for recipient names
   - Preview how your email will look for each recipient

3. **Review and Send**:

   - Enter your email credentials (these are used only for the current session and not stored)
   - Check your email template and recipient list
   - Click "Send Emails" to send personalized emails to all recipients

4. **View Results**:
   - See which emails were sent successfully
   - Option to resend to failed recipients

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

The server uses only one environment variable:

- `PORT`: The port on which the server runs (default: 5000)
