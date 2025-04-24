import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    Grid,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';
import axios from 'axios';
import config from '../config';

const AIRecipientsUploader = ({
    recipientsData,
    onUpload,
    onSelectRecipient,
    selectedRecipientIndex,
    resumeFile,
    resumeUploadStatus,
    onResumeUpload
}) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        jobDescription: '',
        companyProfile: '',
        notes: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.name.endsWith('.csv')) {
            // Read the file content
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                try {
                    // Try different CSV parsing approaches
                    let validRecipients = [];

                    // First try Papa Parse with header detection
                    Papa.parse(content, {
                        header: true,
                        complete: function (results) {
                            if (results.data.length > 0 && Object.keys(results.data[0]).length >= 2) {
                                // Try to intelligently map columns to fields
                                const firstRow = results.data[0];
                                const headers = Object.keys(firstRow);

                                const columnMapping = {
                                    name: null,
                                    email: null,
                                    jobDescription: null,
                                    companyProfile: null,
                                    notes: null
                                };

                                // Try to find matches for each field
                                headers.forEach(header => {
                                    const lowerHeader = header.toLowerCase().trim();

                                    if (lowerHeader === 'name' || lowerHeader === 'recipient' || lowerHeader === 'contact' || lowerHeader === 'company') {
                                        columnMapping.name = header;
                                    } else if (lowerHeader === 'email' || lowerHeader === 'e-mail' || lowerHeader === 'mail' || lowerHeader.includes('email')) {
                                        columnMapping.email = header;
                                    } else if (lowerHeader.includes('job') || lowerHeader.includes('description') || lowerHeader.includes('position')) {
                                        columnMapping.jobDescription = header;
                                    } else if (lowerHeader.includes('company') || lowerHeader.includes('organization') || lowerHeader.includes('firm') || lowerHeader.includes('profile')) {
                                        columnMapping.companyProfile = header;
                                    } else if (lowerHeader.includes('note') || lowerHeader.includes('comment')) {
                                        columnMapping.notes = header;
                                    }
                                });

                                // If we still don't have name and email, use the first two columns
                                if (!columnMapping.name) columnMapping.name = headers[0];
                                if (!columnMapping.email) columnMapping.email = headers[1];

                                // Process data with our column mapping
                                validRecipients = results.data
                                    .filter(row =>
                                        row[columnMapping.email] &&
                                        row[columnMapping.name] &&
                                        row[columnMapping.email].trim() !== '' &&
                                        row[columnMapping.name].trim() !== ''
                                    )
                                    .map(row => {
                                        // Handle multiple email addresses (comma or semicolon separated)
                                        const emailValue = row[columnMapping.email].trim();
                                        const emails = emailValue.split(/[,;]/)
                                            .map(e => e.trim())
                                            .filter(e => e && e.includes('@'));

                                        return {
                                            name: row[columnMapping.name].trim(),
                                            email: emails.length > 0 ? emails[0] : '',
                                            emails: emails,
                                            jobDescription: columnMapping.jobDescription ? (row[columnMapping.jobDescription] || '') : '',
                                            companyProfile: columnMapping.companyProfile ? (row[columnMapping.companyProfile] || '') : '',
                                            notes: columnMapping.notes ? (row[columnMapping.notes] || '') : ''
                                        };
                                    });
                            }
                        }
                    });

                    // Also try parsing without headers (simpler format)
                    Papa.parse(content, {
                        header: false,
                        complete: function (results) {
                            if (results.data.length > 0 && validRecipients.length === 0) {
                                // Process each row assuming fixed column positions:
                                // Col 0 = Name, Col 1 = Email, Col 2 = Job Description, Col 3 = Company Profile, Col 4 = Notes
                                const parsedRecipients = results.data
                                    .filter(row => row.length >= 2 && row[0] && row[1]) // Need at least name and email
                                    .map(row => {
                                        // Handle multiple email addresses
                                        const emailValue = row[1].trim();
                                        const emails = emailValue.split(/[,;]/)
                                            .map(e => e.trim())
                                            .filter(e => e && e.includes('@'));

                                        return {
                                            name: row[0].trim(),
                                            email: emails.length > 0 ? emails[0] : '',
                                            emails: emails,
                                            jobDescription: row.length > 2 ? (row[2] || '') : '',
                                            companyProfile: row.length > 3 ? (row[3] || '') : '',
                                            notes: row.length > 4 ? (row[4] || '') : ''
                                        };
                                    });

                                // Add valid recipients if we found any this way
                                if (parsedRecipients.length > 0) {
                                    validRecipients = parsedRecipients;
                                }
                            }
                        }
                    });

                    // If Papa Parse didn't find valid data, try manual parsing
                    if (validRecipients.length === 0) {
                        // Try simple CSV format (one recipient per line)
                        const lines = content.split('\n').filter(line => line.trim());

                        for (const line of lines) {
                            // Skip header row
                            if (line.toLowerCase().includes('name') && line.toLowerCase().includes('email')) continue;

                            // Handle quoted CSV format: "Name with, comma",email@example.com
                            const quotedMatch = line.match(/"([^"]+)"\s*,\s*(.+)/);
                            if (quotedMatch) {
                                const name = quotedMatch[1].trim();
                                const emailPart = quotedMatch[2].trim();

                                // Extract emails (may be multiple separated by commas)
                                const emails = emailPart.split(/[,;]/)
                                    .map(e => e.trim().replace(/"/g, ''))
                                    .filter(e => e && e.includes('@'));

                                if (name && emails.length > 0) {
                                    validRecipients.push({
                                        name: name,
                                        email: emails[0],
                                        emails: emails,
                                        jobDescription: '',
                                        companyProfile: '',
                                        notes: ''
                                    });
                                }
                            } else {
                                // Simple CSV: name,email[,job description][,company profile][,notes]
                                const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
                                if (parts.length >= 2) {
                                    // Extract emails (may be multiple in the second column)
                                    const emailPart = parts[1];
                                    const emails = emailPart.split(/[,;]/)
                                        .filter(e => e && e.includes('@'));

                                    if (parts[0] && emails.length > 0) {
                                        validRecipients.push({
                                            name: parts[0],
                                            email: emails[0],
                                            emails: emails,
                                            jobDescription: parts.length > 2 ? parts[2] : '',
                                            companyProfile: parts.length > 3 ? parts[3] : '',
                                            notes: parts.length > 4 ? parts[4] : ''
                                        });
                                    }
                                }
                            }
                        }
                    }

                    // Upload valid recipients
                    if (validRecipients.length > 0) {
                        onUpload(validRecipients);
                        setErrorMessage('');
                    } else {
                        setErrorMessage('No valid recipients found in the CSV file. Make sure your file has name and email columns.');
                    }
                } catch (error) {
                    setErrorMessage('Error parsing CSV file: ' + error.message);
                }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.json')) {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target.result);
                        if (Array.isArray(json)) {
                            const validRecipients = json
                                .filter(item => item.email && item.name)
                                .map(item => ({
                                    name: item.name.trim(),
                                    email: item.email.trim(),
                                    jobDescription: item.jobDescription || '',
                                    companyProfile: item.companyProfile || '',
                                    notes: item.notes || ''
                                }));

                            if (validRecipients.length > 0) {
                                onUpload(validRecipients);
                                setErrorMessage('');
                            } else {
                                setErrorMessage('No valid recipients found in the JSON file.');
                            }
                        } else {
                            setErrorMessage('JSON file must contain an array of recipients.');
                        }
                    } catch (error) {
                        setErrorMessage('Failed to parse JSON file.');
                    }
                };
                reader.readAsText(file);
            } catch (error) {
                setErrorMessage('Failed to read the JSON file.');
            }
        } else {
            setErrorMessage('Please upload a CSV or JSON file.');
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setErrorMessage('Please upload a PDF file for your resume.');
            return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('File is too large. Maximum size is 5MB.');
            return;
        }

        setUploading(true);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await axios.post(`${config.API_URL}/api/resume/upload-resume`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Use the shared resume upload handler from App.js
                onResumeUpload(file, response.data.textContent || '');
                setErrorMessage('');
            } else {
                setErrorMessage(response.data.message || 'Failed to upload resume.');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error uploading resume.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRecipient = (index) => {
        const updatedRecipients = recipientsData.filter((_, i) => i !== index);
        onUpload(updatedRecipients);

        // Update selected index if needed
        if (index === selectedRecipientIndex) {
            if (updatedRecipients.length > 0) {
                if (index >= updatedRecipients.length) {
                    onSelectRecipient(updatedRecipients.length - 1);
                }
            }
        } else if (index < selectedRecipientIndex) {
            onSelectRecipient(selectedRecipientIndex - 1);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddRecipient = () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            setErrorMessage('Name and email are required');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email.trim())) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        const newRecipient = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            jobDescription: formData.jobDescription.trim(),
            companyProfile: formData.companyProfile.trim(),
            notes: formData.notes.trim()
        };

        if (editMode && editIndex !== null) {
            const updatedRecipients = [...recipientsData];
            updatedRecipients[editIndex] = newRecipient;
            onUpload(updatedRecipients);
            setEditMode(false);
            setEditIndex(null);
        } else {
            onUpload([...recipientsData, newRecipient]);
        }

        setFormData({
            name: '',
            email: '',
            jobDescription: '',
            companyProfile: '',
            notes: ''
        });

        setErrorMessage('');
        setEditDialogOpen(false);
    };

    const handleEditRecipient = (index) => {
        const recipient = recipientsData[index];
        setFormData({
            name: recipient.name || '',
            email: recipient.email || '',
            jobDescription: recipient.jobDescription || '',
            companyProfile: recipient.companyProfile || '',
            notes: recipient.notes || ''
        });
        setEditMode(true);
        setEditIndex(index);
        setEditDialogOpen(true);
    };

    const handleCancelEdit = () => {
        setFormData({
            name: '',
            email: '',
            jobDescription: '',
            companyProfile: '',
            notes: ''
        });
        setEditMode(false);
        setEditIndex(null);
        setEditDialogOpen(false);
    };

    // Add a method to download a sample CSV
    const downloadSampleCSV = () => {
        const csvContent =
            `"Name","Email","Job Description","Company Profile","Notes"
"John Smith","john@example.com","Software Engineer","Tech Company Inc., a leading software firm","Referral from Jane"
"ABC Corp","contact@abc.com;sales@abc.com","Marketing Director","ABC Corporation is a Fortune 500 company","Multiple contacts"
"Jane Doe","jane@example.com","Project Manager","Innovative Startup","Interested in remote work"

# Headers are optional. You can also simply use:
"Robert Jones","robert@example.com","Data Scientist","Analytics Inc.","Saw job posting online"
"Tech Solutions","info@techsolutions.com;support@techsolutions.com","CTO","AI startup","Looking for technical leadership"`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sample_ai_recipients.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Job Application Targets
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
                Add potential employers individually or upload a CSV/JSON file with job information.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, mb: 2, height: '100%' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Upload Targets
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Upload CSV/JSON File
                            <input
                                type="file"
                                hidden
                                accept=".csv,.json"
                                onChange={handleFileUpload}
                            />
                        </Button>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Upload a CSV or JSON file with your contacts. Headers are not required - just include data in this order: Name, Email, Job Description, Company Profile, Notes. Multiple emails can be separated with commas or semicolons.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setFormData({
                                        name: '',
                                        email: '',
                                        jobDescription: '',
                                        companyProfile: '',
                                        notes: ''
                                    });
                                    setEditIndex(-1);
                                    setEditDialogOpen(true);
                                }}
                                sx={{ flex: 1, mr: 1 }}
                            >
                                Add Target
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={downloadSampleCSV}
                                sx={{ flex: 1, ml: 1 }}
                            >
                                Sample CSV
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, mb: 2, height: '100%' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Upload Your Resume
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                            disabled={uploading || resumeFile}
                        >
                            {uploading ? 'Uploading...' : 'Upload Resume (PDF)'}
                            <input
                                type="file"
                                hidden
                                accept="application/pdf"
                                onChange={handleResumeUpload}
                            />
                        </Button>
                        {resumeUploadStatus && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {resumeUploadStatus}
                            </Alert>
                        )}
                        {resumeFile && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    color="secondary"
                                    onClick={() => onResumeUpload(null)}
                                >
                                    Remove Resume
                                </Button>
                            </Box>
                        )}
                        <Typography variant="body2" color="textSecondary">
                            The AI will use your resume to tailor personalized cover letters for each target.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {errorMessage && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    {errorMessage}
                </Typography>
            )}

            <Paper sx={{ p: 2, mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Target List ({recipientsData.length})
                </Typography>

                {recipientsData.length > 0 ? (
                    <List>
                        {recipientsData.map((recipient, index) => (
                            <React.Fragment key={index}>
                                <ListItem
                                    button
                                    onClick={() => onSelectRecipient(index)}
                                    selected={index === selectedRecipientIndex}
                                    secondaryAction={
                                        <Box>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditRecipient(index);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRecipient(index);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={`${recipient.name} (${recipient.email})`}
                                        secondary={recipient.jobDescription ? `Job: ${recipient.jobDescription.substring(0, 50)}${recipient.jobDescription.length > 50 ? '...' : ''}` : ''}
                                    />
                                </ListItem>
                                {index < recipientsData.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No targets added yet. Upload a file or add targets manually.
                    </Typography>
                )}
            </Paper>

            <Dialog open={editDialogOpen} onClose={handleCancelEdit} fullWidth maxWidth="md">
                <DialogTitle>{editMode ? 'Edit Target' : 'Add New Target'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                                variant="outlined"
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleFormChange}
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
                                onChange={handleFormChange}
                                multiline
                                rows={4}
                                variant="outlined"
                                margin="normal"
                                placeholder="Paste the full job description here"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Company Profile"
                                name="companyProfile"
                                value={formData.companyProfile}
                                onChange={handleFormChange}
                                multiline
                                rows={3}
                                variant="outlined"
                                margin="normal"
                                placeholder="Describe the company (e.g., industry, size, culture, mission)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleFormChange}
                                variant="outlined"
                                margin="normal"
                                placeholder="Any additional notes (e.g., referrals, connections)"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                    <Button
                        onClick={handleAddRecipient}
                        variant="contained"
                        color="primary"
                        disabled={!formData.name || !formData.email}
                    >
                        {editMode ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIRecipientsUploader; 