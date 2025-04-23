import React, { useState } from 'react';
import {
	Container,
	Typography,
	Box,
	Paper,
	Stepper,
	Step,
	StepLabel,
	Button,
	ToggleButtonGroup,
	ToggleButton,
	Grid
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import RecipientsForm from './components/RecipientsForm';
import EmailTemplateForm from './components/EmailTemplateForm';
import ReviewAndSend from './components/ReviewAndSend';
import ResultsScreen from './components/ResultsScreen';
import EmailCredentialsForm from './components/EmailCredentialsForm';
import AIEmailForm from './components/AIEmailForm';
import AIRecipientsUploader from './components/AIRecipientsUploader';
import AIAuthDialog from './components/AIAuthDialog';
import config from './config';

const standardSteps = ['Email Account', 'Recipients', 'Email Template', 'Review & Send'];
const aiModeSteps = ['Email Account', 'Upload Targets', 'AI Email Generator', 'Review & Send'];

function App() {
	const [activeStep, setActiveStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState('standard'); // 'standard' or 'ai'
	const [emailData, setEmailData] = useState({
		recipients: [],
		emailTemplate: '',
		subject: '',
		signature: '',
		emailConfig: {
			email: '',
			password: '',
			service: 'gmail',
			credentialsSaved: false
		},
		attachments: [],
		resume: '', // Added for AI mode
		resumeContent: '', // For text-based resume
	});
	const [results, setResults] = useState(null);
	const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(-1);

	// Add states for AI authentication
	const [isAIAuthenticated, setIsAIAuthenticated] = useState(false);
	const [showAuthDialog, setShowAuthDialog] = useState(false);

	// Add shared state for resume file
	const [resumeFile, setResumeFile] = useState(null);
	const [resumeUploadStatus, setResumeUploadStatus] = useState('');

	// Determine which steps to show based on mode
	const steps = mode === 'standard' ? standardSteps : aiModeSteps;

	const handleRecipientsUpload = (recipients) => {
		setEmailData(prev => ({
			...prev,
			recipients
		}));
		if (recipients.length > 0) {
			setSelectedRecipientIndex(0);
		}
	};

	const handleModeChange = (event, newMode) => {
		if (newMode !== null) {
			// If trying to switch to AI mode and not authenticated yet
			if (newMode === 'ai' && !isAIAuthenticated) {
				setShowAuthDialog(true);
				return; // Don't switch mode yet
			}

			setMode(newMode);
			setActiveStep(0); // Reset to first step when changing modes
			setSelectedRecipientIndex(-1); // Reset selected recipient
		}
	};

	const handleAuthentication = (success) => {
		if (success) {
			setIsAIAuthenticated(true);
			setMode('ai'); // Now that authentication is successful, switch the mode
		}
	};

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
			emailConfig: {
				email: '',
				password: '',
				service: 'gmail',
				credentialsSaved: false
			},
			attachments: [],
			resume: '',
			resumeContent: '',
		});
		setResults(null);
		setSelectedRecipientIndex(-1);
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
			alert(`Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// Handle resume upload once and share between components
	const handleResumeUpload = (file, textContent = '') => {
		setResumeFile(file);
		setEmailData(prev => ({
			...prev,
			resumeContent: textContent
		}));
		if (file) {
			setResumeUploadStatus(`Resume uploaded: ${file.name}`);
		} else {
			setResumeUploadStatus('');
		}
	};

	// Handle attachments in a centralized way
	const handleAttachmentUpload = (newAttachments) => {
		setEmailData(prev => ({
			...prev,
			attachments: [...prev.attachments, ...newAttachments]
		}));
	};

	const handleRemoveAttachment = (index) => {
		setEmailData(prev => ({
			...prev,
			attachments: prev.attachments.filter((_, i) => i !== index)
		}));
	};

	const getStepContent = (step) => {
		// Standard mode content
		if (mode === 'standard') {
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
							onAttachmentUpload={handleAttachmentUpload}
							onRemoveAttachment={handleRemoveAttachment}
						/>
					);
				case 3:
					return (
						<ReviewAndSend
							emailData={emailData}
							loading={loading}
							onSend={handleSendEmails}
							onRemoveAttachment={handleRemoveAttachment}
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
		}
		// AI mode content
		else {
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
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<AIRecipientsUploader
									recipientsData={emailData.recipients}
									onUpload={handleRecipientsUpload}
									onSelectRecipient={(index) => setSelectedRecipientIndex(index)}
									selectedRecipientIndex={selectedRecipientIndex}
									resumeFile={resumeFile}
									resumeUploadStatus={resumeUploadStatus}
									onResumeUpload={handleResumeUpload}
								/>
							</Grid>
						</Grid>
					);
				case 2:
					return (
						<AIEmailForm
							setEmailData={setEmailData}
							selectedRecipient={emailData.recipients.length > 0 ?
								emailData.recipients[selectedRecipientIndex] : null}
							recipientList={emailData.recipients}
							selectedRecipientIndex={selectedRecipientIndex}
							onSelectRecipient={setSelectedRecipientIndex}
							resumeFile={resumeFile}
							resumeUploadStatus={resumeUploadStatus}
							onResumeUpload={handleResumeUpload}
							resumeContent={emailData.resumeContent}
							attachments={emailData.attachments}
							onAttachmentUpload={handleAttachmentUpload}
							onRemoveAttachment={handleRemoveAttachment}
						/>
					);
				case 3:
					return (
						<ReviewAndSend
							emailData={emailData}
							loading={loading}
							onSend={handleSendEmails}
							isAIMode={true}
							onRemoveAttachment={handleRemoveAttachment}
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
		}
	};

	// Check if current step is complete and can proceed
	const isStepComplete = (step) => {
		const commonChecks = {
			0: emailData.emailConfig && // Email Account
				emailData.emailConfig.email &&
				emailData.emailConfig.password &&
				emailData.emailConfig.service &&
				emailData.emailConfig.credentialsSaved,
		};

		if (mode === 'standard') {
			return {
				...commonChecks,
				1: emailData.recipients && emailData.recipients.length > 0, // Recipients
				2: emailData.emailTemplate && emailData.subject, // Email Template
				3: true, // Review & Send
			}[step] ?? true;
		} else {
			return {
				...commonChecks,
				1: emailData.recipients && emailData.recipients.length > 0, // Upload Targets
				2: emailData.emailTemplate && emailData.subject, // AI Email Generator
				3: true, // Review & Send
			}[step] ?? true;
		}
	};

	return (
		<Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
			<Box sx={{ my: { xs: 2, sm: 4 } }}>
				<Typography variant="h4" component="h1" align="center" gutterBottom sx={{
					fontSize: { xs: '1.75rem', sm: '2.125rem' }
				}}>
					MailMerge Pro
				</Typography>

				{activeStep === 0 && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
						<ToggleButtonGroup
							value={mode}
							exclusive
							onChange={handleModeChange}
							aria-label="app mode"
							size="small"
						>
							<ToggleButton value="standard" aria-label="standard mode">
								<EditIcon sx={{ mr: 1 }} />
								Standard Mode
							</ToggleButton>
							<ToggleButton value="ai" aria-label="ai mode">
								{!isAIAuthenticated && <LockIcon sx={{ mr: 0.5 }} fontSize="small" />}
								<AutoAwesomeIcon sx={{ mr: 1 }} />
								AI Job Application Mode
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>
				)}

				<Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
					{activeStep < 4 ? (
						<>
							<Stepper
								activeStep={activeStep}
								sx={{
									mb: 3,
									display: { xs: 'none', sm: 'flex' }
								}}
							>
								{steps.map((label) => (
									<Step key={label}>
										<StepLabel>{label}</StepLabel>
									</Step>
								))}
							</Stepper>

							{/* Mobile stepper - just show current step */}
							<Box sx={{
								display: { xs: 'flex', sm: 'none' },
								justifyContent: 'center',
								mb: 3
							}}>
								<Typography variant="h6" color="primary">
									Step {activeStep + 1}: {steps[activeStep]}
								</Typography>
							</Box>

							<Box>
								{getStepContent(activeStep)}
								<Box sx={{
									display: 'flex',
									flexDirection: { xs: 'column', sm: 'row' },
									justifyContent: { xs: 'center', sm: 'space-between' },
									alignItems: 'center',
									gap: 2,
									mt: 3
								}}>
									<Button
										disabled={activeStep === 0}
										onClick={handleBack}
										sx={{
											order: { xs: 2, sm: 1 },
											width: { xs: '100%', sm: 'auto' }
										}}
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
											sx={{
												order: { xs: 1, sm: 2 },
												width: { xs: '100%', sm: 'auto' }
											}}
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

			{/* Authentication Dialog */}
			<AIAuthDialog
				open={showAuthDialog}
				onClose={() => setShowAuthDialog(false)}
				onAuthenticate={handleAuthentication}
			/>
		</Container>
	);
}

export default App; 