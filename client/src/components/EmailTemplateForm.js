import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
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
    Divider,
    useTheme,
    Card,
    CardContent,
    IconButton,
    Alert,
    Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
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

const EmailTemplateForm = ({
    emailTemplate,
    subject,
    setEmailData,
    attachments,
    onAttachmentUpload,
    onRemoveAttachment
}) => {
    const theme = useTheme();
    const [signatureHtml, setSignatureHtml] = useState('');
    const [includeSignature, setIncludeSignature] = useState(false);
    const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
    const [signatureType, setSignatureType] = useState('plain'); // 'plain' or 'html'
    const [infoOpen, setInfoOpen] = useState(true);

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
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                gap: 1
            }}>
                <EmailOutlinedIcon color="primary" fontSize="medium" />
                <Typography variant="h6" component="h2" fontWeight="600">
                    Email Template
                </Typography>
            </Box>

            <Collapse in={infoOpen}>
                <Alert
                    severity="info"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setInfoOpen(false)}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(51, 185, 255, 0.1)',
                        border: '1px solid rgba(51, 185, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        '& .MuiAlert-icon': {
                            alignItems: 'center'
                        },
                        py: 0.5
                    }}
                >
                    <Typography variant="body2">
                        Use <strong>{'{name}'}</strong> as placeholder for recipient names. URLs like <strong>https://example.com</strong> become clickable links.
                    </Typography>
                </Alert>
            </Collapse>

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="500" gutterBottom>
                    Compose Email
                </Typography>

                <TextField
                    label="Email Subject *"
                    value={subject}
                    onChange={handleSubjectChange}
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />

                <TextField
                    label="Email Content *"
                    value={emailTemplate}
                    onChange={handleTemplateChange}
                    fullWidth
                    multiline
                    rows={7}
                    margin="dense"
                    required
                    placeholder="Enter your email template with {name} as placeholder for recipient names."
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontFamily: 'inherit',
                        }
                    }}
                />

                <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={includeSignature}
                                onChange={handleIncludeSignatureChange}
                                color="primary"
                                size="small"
                            />
                        }
                        label={<Typography variant="body2">Include signature</Typography>}
                    />

                    <Button
                        variant="outlined"
                        onClick={() => setOpenSignatureDialog(true)}
                        disabled={!includeSignature}
                        size="small"
                        sx={{
                            borderRadius: 2,
                            borderWidth: '1.5px',
                            '&:hover': {
                                borderWidth: '1.5px',
                            }
                        }}
                    >
                        Edit Signature
                    </Button>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <AttachmentsForm
                    attachments={attachments}
                    onAttachmentUpload={onAttachmentUpload}
                    onRemoveAttachment={onRemoveAttachment}
                />
            </Box>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    backgroundColor: 'rgba(25, 25, 40, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <CardContent>
                    <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                        Email Preview
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                        <Box sx={{
                            backgroundColor: 'rgba(20, 20, 35, 0.6)',
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <Typography variant="subtitle2" color="primary.light" gutterBottom>
                                Subject: {subject || '(No subject)'}
                            </Typography>

                            <Box sx={{ mt: 1 }}>
                                <Box
                                    dangerouslySetInnerHTML={{
                                        __html: processTemplatePreview(emailTemplate) || '(No content)'
                                    }}
                                    sx={{
                                        minHeight: '100px',
                                        '& p': { mt: 0 },
                                        '& a': {
                                            color: theme.palette.primary.light,
                                            textDecoration: 'underline'
                                        }
                                    }}
                                />

                                {includeSignature && signatureHtml && (
                                    <>
                                        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                                        <Box
                                            dangerouslySetInnerHTML={{
                                                __html: signatureType === 'plain'
                                                    ? formatPlainTextSignature(signatureHtml)
                                                    : signatureHtml
                                            }}
                                            sx={{
                                                '& a': {
                                                    color: theme.palette.primary.light,
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        />
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Signature Dialog */}
            <Dialog
                open={openSignatureDialog}
                onClose={() => setOpenSignatureDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        backgroundColor: 'rgba(30, 30, 45, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <DialogTitle>Edit Email Signature</DialogTitle>

                <DialogContent dividers>
                    <FormLabel component="legend" sx={{ mb: 1 }}>Signature Format</FormLabel>
                    <RadioGroup
                        row
                        value={signatureType}
                        onChange={handleSignatureTypeChange}
                        sx={{ mb: 2 }}
                    >
                        <FormControlLabel value="plain" control={<Radio />} label="Plain Text" />
                        <FormControlLabel value="html" control={<Radio />} label="HTML" />
                    </RadioGroup>

                    <TextField
                        value={signatureHtml}
                        onChange={handleSignatureChange}
                        fullWidth
                        multiline
                        rows={10}
                        placeholder={signatureType === 'plain'
                            ? "Enter your plain text signature. URLs and email addresses will be automatically converted to links."
                            : "Enter your HTML signature with formatting."
                        }
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontFamily: signatureType === 'html' ? 'monospace' : 'inherit'
                            }
                        }}
                    />

                    {signatureType === 'plain' && (
                        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="body2">
                                URLs and email addresses will be automatically converted to clickable links.
                            </Typography>
                        </Alert>
                    )}

                    {signatureType === 'html' && (
                        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="body2">
                                You can use HTML tags for formatting. Links should be written as <code>{'<a href="https://example.com">Example</a>'}</code>
                            </Typography>
                        </Alert>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                        <Box
                            sx={{
                                p: 2,
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 2,
                                backgroundColor: 'rgba(20, 20, 35, 0.6)',
                                minHeight: '100px',
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: signatureType === 'plain'
                                        ? formatPlainTextSignature(signatureHtml) || '(Empty signature)'
                                        : signatureHtml || '(Empty signature)'
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenSignatureDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            borderWidth: '1.5px',
                            '&:hover': {
                                borderWidth: '1.5px',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveSignature}
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #3967d4 10%, #5e90ff 90%)',
                            boxShadow: '0 4px 15px rgba(61, 106, 212, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #3463c9 10%, #4e83f5 90%)',
                                boxShadow: '0 6px 20px rgba(61, 106, 212, 0.4)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Save Signature
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmailTemplateForm; 