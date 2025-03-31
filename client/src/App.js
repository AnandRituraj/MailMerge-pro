import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button
} from '@mui/material';
import RecipientsForm from './components/RecipientsForm';
import EmailTemplateForm from './components/EmailTemplateForm';
import ReviewAndSend from './components/ReviewAndSend';
import ResultsScreen from './components/ResultsScreen';
import EmailCredentialsForm from './components/EmailCredentialsForm';
import config from './config';

const steps = ['Email Account', 'Recipients', 'Email Template', 'Review & Send'];

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [emailData, setEmailData] = useState({
        recipients: [],
        emailTemplate: '',
        subject: '',
        signature: '',
        emailConfig: null,
        attachments: []
    });
    const [results, setResults] = useState(null);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setEmailData({
            recipients: [],
            emailTemplate: '',
            subject: '',
            signature: '',
            emailConfig: null,
            attachments: []
        });
        setResults(null);
    };

    const handleSendEmails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.API_URL}/api/send-emails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send emails');
            }

            setResults(data);
            handleNext(); // Move to results screen
        } catch (error) {
            console.error('Error sending emails:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <EmailCredentialsForm
                        emailConfig={emailData.emailConfig}
                        setEmailData={setEmailData}
                    />
                );
            case 1:
                return (
                    <RecipientsForm
                        recipients={emailData.recipients}
                        setEmailData={setEmailData}
                    />
                );
            case 2:
                return (
                    <EmailTemplateForm
                        emailTemplate={emailData.emailTemplate}
                        subject={emailData.subject}
                        attachments={emailData.attachments}
                        setEmailData={setEmailData}
                    />
                );
            case 3:
                return (
                    <ReviewAndSend
                        emailData={emailData}
                        loading={loading}
                        onSend={handleSendEmails}
                    />
                );
            case 4:
                return (
                    <ResultsScreen
                        results={results}
                        onReset={handleReset}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    // Check if current step is complete and can proceed
    const isStepComplete = (step) => {
        switch (step) {
            case 0: // Email Account
                return emailData.emailConfig &&
                    emailData.emailConfig.email &&
                    emailData.emailConfig.password &&
                    emailData.emailConfig.service;
            case 1: // Recipients
                return emailData.recipients && emailData.recipients.length > 0;
            case 2: // Email Template
                return emailData.emailTemplate && emailData.subject;
            default:
                return true;
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    MailMerge Pro
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    {activeStep < 4 ? (
                        <>
                            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <Box>
                                {getStepContent(activeStep)}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                    >
                                        Back
                                    </Button>
                                    {activeStep === steps.length - 1 ? (
                                        <Box />
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            disabled={!isStepComplete(activeStep)}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </>
                    ) : (
                        getStepContent(activeStep)
                    )}
                </Paper>
            </Box>
        </Container>
    );
}

export default App; 