import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    CircularProgress,
    Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const ReviewAndSend = ({ emailData, loading, onSend }) => {
    const { recipients, emailTemplate, subject, signature, emailConfig, attachments } = emailData;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Review and Send
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
                <Typography variant="body2">
                    Please review your email template and recipients before sending.
                    The emails will be personalized for each recipient using their name.
                    URLs will automatically be converted to clickable links in the sent emails.
                    <br /><br />
                    For recipients with multiple email addresses, the first email will be the primary recipient
                    and additional emails will be added as BCC recipients.
                </Typography>
            </Paper>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Email Account
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                        From: {emailConfig?.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Service: {emailConfig?.service}
                    </Typography>
                </Paper>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Email Template
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Subject: {subject}
                    </Typography>
                    <Box>
                        <Typography
                            variant="body1"
                            component="div"
                            sx={{ whiteSpace: 'pre-wrap' }}
                            dangerouslySetInnerHTML={{
                                __html: emailTemplate
                                    .replace(/{name}/g, '<strong>[Recipient Name]</strong>')
                            }}
                        />
                        {signature && (
                            <Box
                                sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}
                                dangerouslySetInnerHTML={{ __html: signature }}
                            />
                        )}
                    </Box>
                </Paper>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Recipients ({recipients.length})
                </Typography>

                {recipients.length > 0 ? (
                    <Paper variant="outlined">
                        <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                            {recipients.map((recipient, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={recipient.name}
                                            secondary={
                                                <>
                                                    {recipient.emails && recipient.emails.length > 1 ? (
                                                        <>
                                                            <strong>{recipient.emails[0]}</strong> (primary)
                                                            <br />
                                                            <Typography variant="caption" component="span">
                                                                + {recipient.emails.length - 1} additional {recipient.emails.length - 1 === 1 ? 'email' : 'emails'} (BCC)
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        recipient.email
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < recipients.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="error">
                        No recipients added yet. Please go back and add recipients.
                    </Typography>
                )}
            </Box>

            {attachments && attachments.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Attachments ({attachments.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {attachments.map((attachment, index) => (
                                <Chip
                                    key={index}
                                    icon={<AttachFileIcon />}
                                    label={attachment.filename}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Paper>
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    onClick={onSend}
                    disabled={loading || recipients.length === 0 || !emailTemplate || !subject || !emailConfig}
                    sx={{ px: 4, py: 1.5 }}
                >
                    {loading ? 'Sending...' : 'Send Emails'}
                </Button>
            </Box>

            {(recipients.length === 0 || !emailTemplate || !subject || !emailConfig) ? (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                    {!emailConfig ? 'Email account configuration is required. ' : ''}
                    {!subject ? 'Email subject is required. ' : ''}
                    {!emailTemplate ? 'Email template is required. ' : ''}
                    {recipients.length === 0 ? 'At least one recipient is required.' : ''}
                </Typography>
            ) : null}
        </Box>
    );
};

export default ReviewAndSend; 