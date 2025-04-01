import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Paper,
    Switch,
    FormControlLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    Radio,
    FormLabel,
} from '@mui/material';
import AttachmentsForm from './AttachmentsForm';

// Helper function to format plain text signature to HTML with links
const formatPlainTextSignature = (text) => {
    if (!text) return '';

    // First convert plain text to HTML with line breaks preserved
    let htmlText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

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

    // Handle specific domains like www.jycarriers.com directly
    htmlText = htmlText.replace(
        'www.jycarriers.com',
        '<a href="http://www.jycarriers.com" style="display:inline; text-decoration:underline;">www.jycarriers.com</a>'
    );

    return htmlText;
};

const EmailTemplateForm = ({ emailTemplate, subject, setEmailData, attachments }) => {
    const [signatureHtml, setSignatureHtml] = useState('');
    const [includeSignature, setIncludeSignature] = useState(false);
    const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
    const [signatureType, setSignatureType] = useState('plain'); // 'plain' or 'html'

    const handleTemplateChange = (e) => {
        setEmailData((prev) => ({
            ...prev,
            emailTemplate: e.target.value,
        }));
    };

    const handleSubjectChange = (e) => {
        setEmailData((prev) => ({
            ...prev,
            subject: e.target.value,
        }));
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

    // Process template for preview with auto-linking
    const processTemplatePreview = (template) => {
        if (!template) return '';

        // Replace name placeholder
        let processed = template.replace(/{name}/g, '<strong>[Recipient Name]</strong>');

        // Make URLs clickable
        processed = processed.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" style="display:inline; text-decoration:underline;">$1</a>'
        );

        // Make www links clickable
        processed = processed.replace(
            /(\s|^)(www\.[^\s<]+)/g,
            '$1<a href="http://$2" target="_blank" style="display:inline; text-decoration:underline;">$2</a>'
        );

        // Handle specific domains
        processed = processed.replace(
            'www.jycarriers.com',
            '<a href="http://www.jycarriers.com" target="_blank" style="display:inline; text-decoration:underline;">www.jycarriers.com</a>'
        );

        return processed;
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Email Template
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
                <Typography variant="body2">
                    Create your email template below. Use <strong>{'{name}'}</strong> as a placeholder
                    where you want to insert the recipient's name.
                    <br /><br />
                    Simply paste any URLs (like https://example.com) directly in your text and they will automatically be converted to clickable links.
                    <br /><br />
                    Example: "Hello {'{name}'}, We are excited to invite you to our event. Visit https://example.com for more information."
                </Typography>
            </Paper>

            <TextField
                label="Email Subject"
                variant="outlined"
                fullWidth
                margin="normal"
                value={subject}
                onChange={handleSubjectChange}
                placeholder="Enter the subject of your email"
                required
            />

            <TextField
                label="Email Template"
                variant="outlined"
                fullWidth
                multiline
                rows={12}
                margin="normal"
                value={emailTemplate}
                onChange={handleTemplateChange}
                placeholder="Enter your email template with {name} as placeholder for recipient names. You can also include HTML links."
                required
            />

            <Box sx={{
                mt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'flex-start', sm: 'space-between' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 0 }
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
            >
                <DialogTitle>Edit Your Email Signature</DialogTitle>
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
                        rows={10}
                        variant="outlined"
                        value={signatureHtml}
                        onChange={handleSignatureChange}
                        placeholder={signatureType === 'plain'
                            ? "Type your signature here\nExample:\nJohn Doe\nSales Manager\nEmail: john@example.com\nWebsite: www.example.com"
                            : "Paste your HTML signature here"}
                    />
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    '& > button': {
                        m: 0.5,
                        width: { xs: '100%', sm: 'auto' }
                    }
                }}>
                    <Button onClick={() => setOpenSignatureDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveSignature} variant="contained" color="primary">
                        Save Signature
                    </Button>
                </DialogActions>
            </Dialog>

            {emailTemplate && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Preview
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: { xs: 1.5, sm: 2 },
                            overflowX: 'auto'
                        }}
                    >
                        <Typography variant="subtitle1" gutterBottom>
                            Subject: {subject}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    '& a': {
                                        wordBreak: 'break-all'
                                    }
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: processTemplatePreview(emailTemplate)
                                }}
                            />
                            {includeSignature && signatureHtml && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        pt: 2,
                                        borderTop: '1px solid #e0e0e0',
                                        wordBreak: 'break-word',
                                        '& a': {
                                            wordBreak: 'break-all'
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: signatureType === 'plain'
                                            ? formatPlainTextSignature(signatureHtml)
                                            : signatureHtml
                                    }}
                                />
                            )}
                        </Box>
                    </Paper>
                </Box>
            )}

            {/* Add AttachmentsForm component */}
            <AttachmentsForm
                attachments={attachments}
                setEmailData={setEmailData}
            />
        </Box>
    );
};

export default EmailTemplateForm; 