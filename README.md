# Email Sender App

A web application for sending personalized emails to multiple recipients. The app allows you to create an email template with name placeholders and automatically sends customized emails to each recipient.

## Features

- Add recipients individually or upload CSV/JSON file with recipient information
- Create email templates with name placeholders (`{name}`)
- Preview emails before sending
- Send personalized emails to multiple recipients
- View sending results

## Technologies

- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js and npm installed
- Email account (Gmail or Outlook)
- For Gmail: You need to generate an app password (see setup instructions)
- For Outlook: You need your regular password

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

3. Configure email credentials:

   - Edit the `server/.env` file with your email service and credentials:

   For Gmail:

   ```
   PORT=5000
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

   For Outlook:

   ```
   PORT=5000
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-outlook-email@outlook.com
   EMAIL_PASSWORD=your-outlook-password
   ```

   **Note for Gmail users**:

   - You need to use an "App Password" rather than your regular password
   - Go to your Google Account > Security > 2-Step Verification > App passwords
   - Create a new app password for "Mail" and use it in the .env file

   **Note for Outlook users**:

   - You can use your regular Outlook password
   - If you have 2FA enabled, you may need to create an app password
   - Go to your Microsoft Account > Security > Advanced security options > App passwords

4. Start the server:

```bash
cd server
npm run dev
```

5. Start the client:

```bash
cd client
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

1. **Add Recipients**:

   - Enter name and email manually and click "Add Recipient"
   - Or upload a CSV file with format: `name,email` (one per line)
   - Or upload a JSON file with format: `[{"name": "Name", "email": "email@example.com"}, ...]`

2. **Create Email Template**:

   - Enter the email subject
   - Write your email template using `{name}` as a placeholder for recipient names
   - Preview how your email will look

3. **Review and Send**:

   - Check your email template and recipient list
   - Click "Send Emails" to send personalized emails to all recipients

4. **View Results**:
   - See which emails were sent successfully
   - Option to send more emails

## License

MIT
