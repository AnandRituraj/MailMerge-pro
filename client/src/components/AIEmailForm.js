import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Grid,
    Alert,
    Divider,
    FormControlLabel,
    Switch,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Radio,
    RadioGroup,
    FormLabel,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import config from '../config';
import AttachmentsForm from './AttachmentsForm';

// Helper function to format plain text signature to HTML with links
const formatPlainTextSignature = (text) => {
    if (!text) return '';

    // Convert newlines to <br> tags
    let htmlText = text.replace(/\n/g, '<br>');

    // Make email addresses clickable
    htmlText = htmlText.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1" style="display:inline; text-decoration:underline;">$1</a>'
    );

    // Make URLs clickable (http/https)
    htmlText = htmlText.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="display:inline; text-decoration:underline;">$1</a>'
    );

    // Make www links clickable
    htmlText = htmlText.replace(
        /(\s|^)(www\.[^\s<]+)/g,
        '$1<a href="http://$2" style="display:inline; text-decoration:underline;">$2</a>'
    );

    return htmlText;
};

const AIEmailForm = ({
    setEmailData,
    selectedRecipient,
    recipientList = [],
    resumeFile,
    resumeUploadStatus,
    onResumeUpload,
    resumeContent = '',
    attachments = [],
    onAttachmentUpload,
    onRemoveAttachment
}) => {
    const [formData, setFormData] = useState({
        name: selectedRecipient?.name || '',
        email: selectedRecipient?.email || '',
        jobDescription: selectedRecipient?.jobDescription || '',
        companyProfile: selectedRecipient?.companyProfile || '',
        resume: resumeContent || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedContent, setGeneratedContent] = useState(null);
    const [useResumeFile, setUseResumeFile] = useState(!!resumeFile);
    const [includeSignature, setIncludeSignature] = useState(true);
    const [generateForAllRecipients, setGenerateForAllRecipients] = useState(recipientList.length > 1);
    const [recipientsWithEmails, setRecipientsWithEmails] = useState([]);
    const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1);

    // Signature management
    const [signatureHtml, setSignatureHtml] = useState('');
    const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
    const [signatureType, setSignatureType] = useState('plain'); // 'plain' or 'html'

    // Update formData when selectedRecipient changes
    useEffect(() => {
        if (selectedRecipient) {
            setFormData(prevData => ({
                ...prevData,
                name: selectedRecipient.name || '',
                email: selectedRecipient.email || '',
                jobDescription: selectedRecipient.jobDescription || '',
                companyProfile: selectedRecipient.companyProfile || '',
                resume: resumeContent || prevData.resume
            }));
        }
    }, [selectedRecipient, resumeContent]);

    // Update resume state when shared resumeFile changes
    useEffect(() => {
        setUseResumeFile(!!resumeFile);
    }, [resumeFile]);

    // Fetch existing signature from emailData if provided
    useEffect(() => {
        setEmailData(prevState => {
            if (prevState.signature) {
                setSignatureHtml(prevState.signature);
                setSignatureType(prevState.signatureType || 'plain');
                setIncludeSignature(true);
            }
            return prevState;
        });
    }, [setEmailData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // If editing resume text, update the shared resume content
        if (name === 'resume') {
            onResumeUpload(null, value);
        }
    };

    const handleResumeSwitch = (event) => {
        setUseResumeFile(event.target.checked);
        // Clear any existing resume text/file when switching
        if (event.target.checked) {
            if (!resumeFile) {
                setError('Please upload a resume PDF first');
            }
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are supported.');
            return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('File is too large. Maximum size is 5MB.');
            return;
        }

        // Use the shared resume upload handler
        onResumeUpload(file);
        setError('');
    };

    const generateEmailForRecipient = async (recipientData) => {
        try {
            let response;

            if (useResumeFile && resumeFile) {
                // Create FormData for file upload
                const formDataForUpload = new FormData();
                formDataForUpload.append('resumeFile', resumeFile);
                formDataForUpload.append('name', recipientData.name);
                formDataForUpload.append('email', recipientData.email);
                formDataForUpload.append('jobDescription', recipientData.jobDescription || '');
                formDataForUpload.append('companyProfile', recipientData.companyProfile || '');

                response = await fetch(`${config.API_URL}/api/generate-email-with-resume`, {
                    method: 'POST',
                    body: formDataForUpload,
                });
            } else {
                // Use text resume
                if (!formData.resume.trim()) {
                    throw new Error('Resume content is required.');
                }

                response = await fetch(`${config.API_URL}/api/generate-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: recipientData.name,
                        email: recipientData.email,
                        jobDescription: recipientData.jobDescription || '',
                        companyProfile: recipientData.companyProfile || '',
                        resume: formData.resume,
                    }),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate email');
            }

            return {
                recipient: recipientData,
                emailContent: data.emailContent,
                subject: data.subject
            };
        } catch (error) {
            throw new Error(`Error for ${recipientData.name}: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRecipientsWithEmails([]);

        try {
            if (generateForAllRecipients && recipientList.length > 0) {
                // Generate emails for all recipients sequentially
                const generatedEmails = [];

                for (let i = 0; i < recipientList.length; i++) {
                    setCurrentGeneratingIndex(i);
                    const result = await generateEmailForRecipient(recipientList[i]);
                    generatedEmails.push(result);
                }

                setCurrentGeneratingIndex(-1);
                setRecipientsWithEmails(generatedEmails);

                // Show the first generated email in the preview
                if (generatedEmails.length > 0) {
                    setGeneratedContent({
                        emailContent: generatedEmails[0].emailContent,
                        subject: generatedEmails[0].subject
                    });
                }
            } else {
                // Generate only for the selected recipient
                const result = await generateEmailForRecipient(formData);
                setGeneratedContent({
                    emailContent: result.emailContent,
                    subject: result.subject
                });

                setRecipientsWithEmails([result]);
            }
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignatureChange = (e) => {
        setSignatureHtml(e.target.value);
    };

    const handleSaveSignature = () => {
        // Process the signature based on type
        const processedSignature = signatureType === 'plain'
            ? formatPlainTextSignature(signatureHtml)
            : signatureHtml;

        setEmailData((prev) => ({
            ...prev,
            signature: includeSignature ? processedSignature : '',
            signatureType // Store the signature type
        }));
        setOpenSignatureDialog(false);
    };

    const handleIncludeSignatureChange = (e) => {
        const include = e.target.checked;
        setIncludeSignature(include);

        // Process the signature based on type
        const processedSignature = signatureType === 'plain'
            ? formatPlainTextSignature(signatureHtml)
            : signatureHtml;

        setEmailData((prev) => ({
            ...prev,
            signature: include ? processedSignature : '',
            signatureType // Store the signature type
        }));
    };

    const handleSignatureTypeChange = (e) => {
        setSignatureType(e.target.value);
    };

    const handleUseEmail = () => {
        if (recipientsWithEmails.length > 0) {
            // For multiple recipients, update each recipient with their personalized email
            const updatedRecipients = recipientList.map((recipient, index) => {
                const generatedEmail = recipientsWithEmails.find(item =>
                    item.recipient.email === recipient.email && item.recipient.name === recipient.name);

                if (generatedEmail) {
                    return {
                        ...recipient,
                        personalizedEmail: generatedEmail.emailContent,
                        personalizedSubject: generatedEmail.subject
                    };
                }
                return recipient;
            });

            // Process the signature based on type
            const processedSignature = signatureType === 'plain'
                ? formatPlainTextSignature(signatureHtml)
                : signatureHtml;

            // Update the parent component's email data
            setEmailData(prevState => ({
                ...prevState,
                recipients: updatedRecipients,
                emailTemplate: generatedContent.emailContent, // Use the first email as template
                subject: generatedContent.subject,
                // Keep signature if includeSignature is true, otherwise empty string
                signature: includeSignature ? processedSignature : '',
                signatureType
            }));
        }
    };

    const handleToggleGenerateAll = (e) => {
        setGenerateForAllRecipients(e.target.checked);
    };

    // Show a specific recipient's generated email in the preview
    const showRecipientEmail = (index) => {
        if (recipientsWithEmails[index]) {
            setGeneratedContent({
                emailContent: recipientsWithEmails[index].emailContent,
                subject: recipientsWithEmails[index].subject
            });
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                AI Email Generator
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Enter job details and your resume to generate a personalized cold email for recruiters.
            </Typography>

            {recipientList.length > 1 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={generateForAllRecipients}
                                onChange={handleToggleGenerateAll}
                                color="primary"
                            />
                        }
                        label={`Generate personalized emails for all ${recipientList.length} recipients`}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This will create unique emails tailored to each recipient's job description and company.
                    </Typography>
                </Paper>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {!generateForAllRecipients && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Recipient Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Recipient Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Job Description"
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        margin="normal"
                                        multiline
                                        rows={4}
                                        placeholder="Paste the full job description here"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Company Profile"
                                        name="companyProfile"
                                        value={formData.companyProfile}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        margin="normal"
                                        multiline
                                        rows={3}
                                        placeholder="Briefly describe the company (e.g., industry, size, culture, mission)"
                                    />
                                </Grid>
                            </>
                        )}

                        {generateForAllRecipients && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Recipients ({recipientList.length})
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                    <Box sx={{ maxHeight: '150px', overflowY: 'auto', mb: 2 }}>
                                        {recipientList.map((recipient, index) => (
                                            <Box key={index} sx={{ mb: 1 }}>
                                                <Typography variant="body2">
                                                    <strong>{recipient.name}</strong> - {recipient.email}
                                                    {currentGeneratingIndex === index && (
                                                        <Chip
                                                            size="small"
                                                            label="Generating..."
                                                            color="primary"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Typography>
                                                {recipient.jobDescription && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                                        Job: {recipient.jobDescription.substring(0, 50)}...
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={useResumeFile}
                                            onChange={handleResumeSwitch}
                                            color="primary"
                                        />
                                    }
                                    label="Use uploaded resume (PDF)"
                                />
                            </Box>

                            {useResumeFile ? (
                                <Box>
                                    {resumeFile ? (
                                        <Alert severity="success" icon={<DescriptionIcon />} sx={{ mb: 2 }}>
                                            {resumeUploadStatus}
                                        </Alert>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadFileIcon />}
                                            sx={{ mb: 1 }}
                                            fullWidth
                                        >
                                            Upload Resume (PDF)
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <TextField
                                    fullWidth
                                    label="Your Resume"
                                    name="resume"
                                    value={formData.resume}
                                    onChange={handleChange}
                                    required={!resumeFile}
                                    variant="outlined"
                                    margin="normal"
                                    multiline
                                    rows={6}
                                    placeholder="Paste your resume content here"
                                />
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading || (useResumeFile && !resumeFile)}
                                sx={{ mt: 2 }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={24} sx={{ mr: 1 }} />
                                        {generateForAllRecipients
                                            ? `Generating Emails (${currentGeneratingIndex + 1}/${recipientList.length})...`
                                            : 'Generating Email...'}
                                    </>
                                ) : (
                                    generateForAllRecipients
                                        ? `Generate Personalized Emails for All Recipients`
                                        : 'Generate AI Email'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {generatedContent && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Generated Email
                        {recipientsWithEmails.length > 1 && " Preview"}
                    </Typography>

                    {recipientsWithEmails.length > 1 && (
                        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                                Preview email for:
                            </Typography>
                            {recipientsWithEmails.map((item, index) => (
                                <Chip
                                    key={index}
                                    label={item.recipient.name}
                                    onClick={() => showRecipientEmail(index)}
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Subject:</Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                            {generatedContent.subject}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2">Email Content:</Typography>
                        <Typography
                            variant="body1"
                            component="div"
                            sx={{
                                whiteSpace: 'pre-line',
                                backgroundColor: '#f9f9f9',
                                p: 2,
                                borderRadius: 1,
                                mt: 1
                            }}
                        >
                            {generatedContent.emailContent}
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: { xs: 'flex-start', sm: 'space-between' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 2, sm: 0 },
                        mb: 2
                    }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={includeSignature}
                                    onChange={handleIncludeSignatureChange}
                                    color="primary"
                                />
                            }
                            label="Include signature"
                        />

                        <Button
                            variant="outlined"
                            onClick={() => setOpenSignatureDialog(true)}
                            disabled={!includeSignature}
                            fullWidth={false}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Edit Signature
                        </Button>
                    </Box>

                    {includeSignature && signatureHtml && (
                        <Box sx={{ mb: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Signature Preview:
                            </Typography>
                            <Box
                                sx={{ pt: 1, borderTop: '1px solid #eee' }}
                                dangerouslySetInnerHTML={{
                                    __html: signatureType === 'plain'
                                        ? formatPlainTextSignature(signatureHtml)
                                        : signatureHtml
                                }}
                            />
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleUseEmail}
                        fullWidth
                    >
                        {recipientsWithEmails.length > 1
                            ? `Use These Personalized Emails (${recipientsWithEmails.length})`
                            : 'Use This Email'}
                    </Button>

                    {/* Add attachments form after the "Use This Email" button */}
                    <Box sx={{ mt: 3 }}>
                        <Divider sx={{ my: 2 }} />
                        <AttachmentsForm
                            attachments={attachments}
                            onAttachmentUpload={onAttachmentUpload}
                            onRemoveAttachment={onRemoveAttachment}
                        />
                    </Box>
                </Paper>
            )}

            <Dialog
                open={openSignatureDialog}
                onClose={() => setOpenSignatureDialog(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        width: '100%',
                        m: { xs: 1, sm: 2, md: 3 },
                        maxHeight: '90vh'
                    }
                }}
                aria-labelledby="edit-signature-dialog-title"
            >
                <DialogTitle id="edit-signature-dialog-title">Edit Your Email Signature</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <FormLabel component="legend">Signature Format</FormLabel>
                        <RadioGroup
                            row
                            name="signature-type"
                            value={signatureType}
                            onChange={handleSignatureTypeChange}
                        >
                            <FormControlLabel value="plain" control={<Radio />} label="Plain Text" />
                            <FormControlLabel value="html" control={<Radio />} label="HTML" />
                        </RadioGroup>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {signatureType === 'plain'
                                ? 'Enter your signature as plain text. Line breaks and URLs will be preserved and formatted properly.'
                                : 'Paste your HTML signature below. For images to work properly, they should be referenced with full URLs.'}
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        value={signatureHtml}
                        onChange={handleSignatureChange}
                        placeholder={signatureType === 'plain'
                            ? "Type your signature here\nExample:\nJohn Doe\nSales Manager\nEmail: john@example.com\nWebsite: www.example.com"
                            : "Paste your HTML signature here"}
                        variant="outlined"
                        id="signature-editor"
                    />

                    {signatureType === 'plain' && signatureHtml && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Preview:
                            </Typography>
                            <Box
                                sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, backgroundColor: '#f9f9f9', mt: 1 }}
                                dangerouslySetInnerHTML={{ __html: formatPlainTextSignature(signatureHtml) }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSignatureDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveSignature} variant="contained" color="primary">
                        Save Signature
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIEmailForm; 