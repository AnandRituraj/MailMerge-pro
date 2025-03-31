# MailMerge Pro

A professional web application for sending personalized emails to multiple recipients. The app allows you to create email templates with dynamic placeholders and automatically sends customized emails to each recipient.

## Features

- Add recipients individually or upload CSV/JSON file with recipient information
- Create email templates with dynamic placeholders (`{name}`)
- Preview emails before sending
- Send personalized emails to multiple recipients
- View sending results and delivery status
- Modern, responsive UI

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
│   └── package.json      # Backend dependencies
│
└── .gitignore            # Git ignore file
```

## Getting Started

### Prerequisites

- Node.js (v14+) and npm installed

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

3. Start the development servers:
   Open your browser and navigate to `http://localhost:5000` to access the backend server.

```bash
# Start the backend server (from the server directory)
cd server
npm run dev

# Start the frontend development server (from the client directory)
cd ../client
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

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

   - Check your email template and recipient list
   - Click "Send Emails" to send personalized emails to all recipients

4. **View Results**:
   - See which emails were sent successfully
   - Option to resend to failed recipients

## Development

### Frontend

The client is built with React and uses Material UI for the user interface. The proxy is configured to forward API requests to the backend server running on port 5001.

### Backend

The server is built with Express and uses Nodemailer to send emails. It exposes API endpoints for sending emails and parsing recipient data.

## License

MIT
