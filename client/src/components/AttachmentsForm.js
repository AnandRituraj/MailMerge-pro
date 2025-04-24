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
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="500">
                    Attachments
                </Typography>

                <Button
                    variant="contained"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    size="small"
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #3967d4 10%, #5e90ff 90%)',
                        boxShadow: '0 2px 10px rgba(61, 106, 212, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #3463c9 10%, #4e83f5 90%)',
                            boxShadow: '0 4px 15px rgba(61, 106, 212, 0.4)',
                            transform: 'translateY(-1px)'
                        }
                    }}
                >
                    Add Attachments
                    <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileChange}
                    />
                </Button>
            </Box>

            {fileError && (
                <Chip
                    label={fileError}
                    color="error"
                    size="small"
                    onDelete={() => setFileError('')}
                    sx={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        mb: 1.5
                    }}
                />
            )}

            {attachments.length > 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(25, 25, 40, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                        maxHeight: '120px', // Limit height
                        overflowY: 'auto' // Add scroll for many attachments
                    }}
                >
                    <List disablePadding dense>
                        {attachments.map((attachment, index) => (
                            <ListItem
                                key={index}
                                divider={index < attachments.length - 1}
                                sx={{
                                    py: 0.75,
                                    px: 1.5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    },
                                }}
                            >
                                <InsertDriveFileOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }} />
                                <ListItemText
                                    primary={
                                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                            {attachment.filename} ({getFileSize(attachment.content)})
                                        </Typography>
                                    }
                                    sx={{
                                        margin: 0,
                                        '& .MuiTypography-root': {
                                            wordBreak: 'break-all',
                                        }
                                    }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Maximum file size: 10MB. Supported types: PDF, Word, Excel, images, etc.
                </Typography>
            )}
        </Box>
    );
};

export default AttachmentsForm; 