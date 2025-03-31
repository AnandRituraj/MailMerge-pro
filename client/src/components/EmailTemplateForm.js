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
} from '@mui/material';
import AttachmentsForm from './AttachmentsForm';

const EmailTemplateForm = ({ emailTemplate, subject, setEmailData, attachments }) => {
    const [signatureHtml, setSignatureHtml] = useState('');
    const [includeSignature, setIncludeSignature] = useState(false);
    const [openSignatureDialog, setOpenSignatureDialog] = useState(false);

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
        setEmailData((prev) => ({
            ...prev,
            signature: includeSignature ? signatureHtml : '',
        }));
        setOpenSignatureDialog(false);
    };

    const handleIncludeSignatureChange = (e) => {
        const include = e.target.checked;
        setIncludeSignature(include);
        setEmailData((prev) => ({
            ...prev,
            signature: include ? signatureHtml : '',
        }));
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
                    Example: "Hello {'{name}'}, We are excited to invite you to our event..."
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
                placeholder="Enter your email template with {name} as placeholder for recipient names"
                required
            />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                >
                    Edit Signature
                </Button>
            </Box>

            <Dialog
                open={openSignatureDialog}
                onClose={() => setOpenSignatureDialog(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Edit Your Email Signature</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Paste your HTML signature below. For images to work properly, they should be referenced with full URLs.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        variant="outlined"
                        value={signatureHtml}
                        onChange={handleSignatureChange}
                        placeholder="Paste your HTML signature here"
                    />
                </DialogContent>
                <DialogActions>
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
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Subject: {subject}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{ whiteSpace: 'pre-wrap' }}
                                dangerouslySetInnerHTML={{
                                    __html: emailTemplate.replace(/{name}/g, '<strong>[Recipient Name]</strong>')
                                }}
                            />
                            {includeSignature && signatureHtml && (
                                <Box
                                    sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}
                                    dangerouslySetInnerHTML={{ __html: signatureHtml }}
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