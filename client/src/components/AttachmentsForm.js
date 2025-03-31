import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Paper,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const AttachmentsForm = ({ attachments, setEmailData }) => {
    const [fileError, setFileError] = useState('');

    // Maximum file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setFileError('');

        // Process each file
        const newAttachments = Array.from(files).map(file => {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`File ${file.name} exceeds 10MB limit`);
                return null;
            }

            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        filename: file.name,
                        content: e.target.result.split(',')[1], // Get base64 data without prefix
                        contentType: file.type,
                        encoding: 'base64'
                    });
                };
                reader.readAsDataURL(file);
            });
        }).filter(Boolean); // Remove nulls (files that were too large)

        if (newAttachments.length) {
            Promise.all(newAttachments).then(processedAttachments => {
                setEmailData(prev => ({
                    ...prev,
                    attachments: [...prev.attachments, ...processedAttachments]
                }));
            });
        }
    };

    const handleRemoveAttachment = (index) => {
        setEmailData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const getFileSize = (base64String) => {
        // Calculate size of base64 string in bytes
        const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
        const size = Math.floor((base64String.length * 3) / 4) - padding;

        // Format as KB or MB
        if (size > 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else {
            return `${(size / 1024).toFixed(2)} KB`;
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Attachments
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
                <Typography variant="body2">
                    Attach files to your email. Maximum file size is 10MB per file.
                    Common file types like PDF, Word, Excel, images, etc. are supported.
                </Typography>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ mr: 2 }}
                >
                    Add Attachments
                    <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileChange}
                    />
                </Button>
                {fileError && (
                    <Chip
                        label={fileError}
                        color="error"
                        onDelete={() => setFileError('')}
                    />
                )}
            </Box>

            {attachments.length > 0 && (
                <List>
                    {attachments.map((attachment, index) => (
                        <ListItem key={index} divider>
                            <ListItemText
                                primary={attachment.filename}
                                secondary={getFileSize(attachment.content)}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleRemoveAttachment(index)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default AttachmentsForm; 