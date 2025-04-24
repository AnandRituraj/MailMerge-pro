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
    Chip,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const AttachmentsForm = ({
    attachments = [],
    setEmailData = null,
    onAttachmentUpload = null,
    onRemoveAttachment = null
}) => {
    const [fileError, setFileError] = useState('');

    // Maximum file size (5MB to be safer)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setFileError('');

        // Process each file
        const newAttachments = Array.from(files).map(file => {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`File ${file.name} exceeds 5MB limit. Email attachments should be kept small.`);
                return null;
            }

            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        // Get base64 data without prefix (data:image/jpeg;base64,)
                        const fullResult = e.target.result;
                        const contentType = file.type || 'application/octet-stream';
                        const base64Prefix = `data:${contentType};base64,`;

                        // Make sure we have a proper base64 string
                        let content;
                        if (fullResult.startsWith(base64Prefix)) {
                            content = fullResult.substring(base64Prefix.length);
                        } else {
                            content = fullResult;
                        }

                        resolve({
                            filename: file.name,
                            content: content,
                            contentType: contentType,
                            encoding: 'base64',
                            size: file.size
                        });
                    } catch (error) {
                        console.error('Error processing attachment:', error);
                        setFileError(`Error processing file ${file.name}: ${error.message}`);
                        reject(error);
                    }
                };

                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    setFileError(`Error reading file ${file.name}`);
                    reject(error);
                };

                reader.readAsDataURL(file);
            });
        }).filter(Boolean);

        if (newAttachments.length) {
            Promise.all(newAttachments)
                .then(processedAttachments => {
                    if (onAttachmentUpload) {
                        // Use centralized handler if provided
                        onAttachmentUpload(processedAttachments);
                    } else if (setEmailData) {
                        // Fallback to direct state update
                        setEmailData(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, ...processedAttachments]
                        }));
                    }
                })
                .catch(error => {
                    console.error('Error processing attachments:', error);
                    setFileError('Failed to process attachments. Please try again with smaller files.');
                });
        }
    };

    const handleRemoveFile = (index) => {
        if (onRemoveAttachment) {
            // Use centralized handler if provided
            onRemoveAttachment(index);
        } else if (setEmailData) {
            // Fallback to direct state update
            setEmailData(prev => ({
                ...prev,
                attachments: prev.attachments.filter((_, i) => i !== index)
            }));
        }

        // Clear any previous errors when removing files
        setFileError('');
    };

    const getFileSize = (attachment) => {
        // Use the stored size if available
        if (attachment.size) {
            const sizeInKB = attachment.size / 1024;
            return sizeInKB >= 1024
                ? `${(sizeInKB / 1024).toFixed(2)} MB`
                : `${sizeInKB.toFixed(2)} KB`;
        }

        // Fallback: calculate from base64 content
        if (attachment.content) {
            // Calculate size of base64 string in bytes
            const padding = attachment.content.endsWith('==') ? 2 : attachment.content.endsWith('=') ? 1 : 0;
            const size = Math.floor((attachment.content.length * 3) / 4) - padding;

            // Format as KB or MB
            if (size > 1024 * 1024) {
                return `${(size / (1024 * 1024)).toFixed(2)} MB`;
            } else {
                return `${(size / 1024).toFixed(2)} KB`;
            }
        }

        return 'Unknown size';
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Attachments
            </Typography>

            {fileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {fileError}
                </Alert>
            )}

            <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{
                    mb: 2,
                    borderRadius: 2,
                }}
            >
                Add Attachment
                <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileChange}
                />
            </Button>

            {attachments.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <List dense>
                        {attachments.map((attachment, index) => (
                            <ListItem key={index}>
                                <InsertDriveFileOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <ListItemText
                                    primary={attachment.filename}
                                    secondary={
                                        <Chip
                                            label={getFileSize(attachment)}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default AttachmentsForm; 