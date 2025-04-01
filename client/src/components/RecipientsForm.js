import React, { useState } from 'react';
import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	IconButton,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Collapse,
	Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

const RecipientsForm = ({ recipients, setEmailData }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [nameError, setNameError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [editIndex, setEditIndex] = useState(-1);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editName, setEditName] = useState('');
	const [editEmail, setEditEmail] = useState('');
	const [editNameError, setEditNameError] = useState('');
	const [editEmailError, setEditEmailError] = useState('');
	const [importAlert, setImportAlert] = useState(false);

	const validateEmail = (email) => {
		if (!email) return false;

		// Clean up the email first - remove any trailing commas
		const cleanEmail = email.trim().replace(/,+$/, '');

		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(cleanEmail);
	};

	const validateMultipleEmails = (emailString) => {
		if (!emailString) return { valid: false, emails: [] };

		// First, clean up any quotes and trailing commas
		const cleanString = emailString.replace(/"/g, '').replace(/,+$/, '');

		// Split by comma or semicolon
		const emails = cleanString.split(/[,;]/)
			.map(e => e.trim().replace(/,+$/, '')) // Remove trailing commas for each email
			.filter(e => e);

		console.log('Validating emails:', { original: emailString, cleaned: cleanString, parsed: emails });

		if (emails.length === 0) return { valid: false, emails: [] };

		// Check if all emails are valid
		const validEmails = emails.filter(email => validateEmail(email));
		const allValid = validEmails.length === emails.length;

		// If not all emails are valid, but at least one is valid, still use the valid ones
		return {
			valid: allValid || validEmails.length > 0,
			emails: validEmails.length > 0 ? validEmails : []
		};
	};

	const handleAddRecipient = () => {
		// Reset errors
		setNameError('');
		setEmailError('');

		// Validate inputs
		let isValid = true;

		if (!name.trim()) {
			setNameError('Name is required');
			isValid = false;
		}

		if (!email.trim()) {
			setEmailError('Email is required');
			isValid = false;
		} else {
			const { valid } = validateMultipleEmails(email);
			if (!valid) {
				setEmailError('Please enter valid email addresses (separate multiple emails with commas or semicolons)');
				isValid = false;
			}
		}

		if (!isValid) return;

		// Add recipient to the list with potentially multiple emails
		const { emails: validEmails } = validateMultipleEmails(email);
		const newRecipient = { name: name.trim(), email: email.trim(), emails: validEmails };
		setEmailData((prev) => ({
			...prev,
			recipients: [...prev.recipients, newRecipient],
		}));

		// Clear form
		setName('');
		setEmail('');
	};

	const handleRemoveRecipient = (index) => {
		setEmailData((prev) => ({
			...prev,
			recipients: prev.recipients.filter((_, i) => i !== index),
		}));
	};

	const handleEditRecipient = (index) => {
		const recipient = recipients[index];
		setEditIndex(index);
		setEditName(recipient.name);
		setEditEmail(recipient.email);
		setEditNameError('');
		setEditEmailError('');
		setEditDialogOpen(true);
	};

	const handleSaveEdit = () => {
		// Reset errors
		setEditNameError('');
		setEditEmailError('');

		// Validate inputs
		let isValid = true;

		if (!editName.trim()) {
			setEditNameError('Name is required');
			isValid = false;
		}

		if (!editEmail.trim()) {
			setEditEmailError('Email is required');
			isValid = false;
		} else {
			const { valid } = validateMultipleEmails(editEmail);
			if (!valid) {
				setEditEmailError('Please enter valid email addresses (separate multiple emails with commas or semicolons)');
				isValid = false;
			}
		}

		if (!isValid) return;

		// Update recipient in the list
		const { emails: validEmails } = validateMultipleEmails(editEmail);
		setEmailData((prev) => {
			const updatedRecipients = [...prev.recipients];
			updatedRecipients[editIndex] = {
				name: editName.trim(),
				email: editEmail.trim(),
				emails: validEmails
			};
			return {
				...prev,
				recipients: updatedRecipients,
			};
		});

		// Close dialog
		setEditDialogOpen(false);
	};

	const handleCloseEditDialog = () => {
		setEditDialogOpen(false);
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target.result;
				let recipientsAdded = 0;

				// Try to parse as JSON first
				try {
					const jsonData = JSON.parse(content);
					if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].name && jsonData[0].email) {
						// Process each recipient to add the emails array
						const processedData = jsonData.map(item => {
							const { valid, emails: validEmails } = validateMultipleEmails(item.email);
							return {
								...item,
								emails: valid ? validEmails : [item.email]
							};
						});

						setEmailData((prev) => ({
							...prev,
							recipients: [...prev.recipients, ...processedData],
						}));
						recipientsAdded = jsonData.length;
					}
				} catch (err) {
					// Not valid JSON, continue to CSV parsing
				}

				// Parse as CSV
				if (recipientsAdded === 0) {
					// Special processing for multi-line email addresses
					const content2 = content.replace(/\r\n/g, '\n'); // Normalize line endings
					console.log("Processing CSV content...");

					let companyEmails = [];

					// Find multiline email groups - pattern is quotes around company name, then first email with trailing comma, then multiple lines of just emails
					const lines = content2.split('\n');
					let currentCompany = null;
					let emails = [];
					let i = 0;
					let processingMultilineEmails = false;

					console.log("Total lines in CSV:", lines.length);

					while (i < lines.length) {
						const line = lines[i].trim();
						console.log(`Processing line ${i}: ${line}`);

						// If we find a line that appears to be just an email
						if (line.includes('@') && !line.includes(',@') && !line.startsWith('"')) {
							// This is likely an email line without a company
							// Clean email address
							const cleanEmail = line.trim().replace(/,+$/, '').replace(/"+$/, '');
							if (currentCompany && validateEmail(cleanEmail)) {
								emails.push(cleanEmail);
								console.log(`Added standalone email: ${cleanEmail} to company: ${currentCompany}`);
								processingMultilineEmails = true;
							}
							i++;
							continue;
						}

						// If we hit a new company line but we were processing multiline emails
						if (line.startsWith('"') && processingMultilineEmails) {
							processingMultilineEmails = false;
						}

						if (line.startsWith('"') && line.includes('",')) {
							// This is a new company entry
							// Add previous company if exists
							if (currentCompany && emails.length > 0) {
								companyEmails.push({
									name: currentCompany,
									emails: emails
								});
								console.log(`Added company: ${currentCompany} with ${emails.length} emails`);
							}

							// Extract company name and first email
							const parts = line.match(/"([^"]+)","?([^"]+)"?/) ||
								line.match(/"([^"]+)",([^"]+)/);

							if (parts && parts.length >= 3) {
								currentCompany = parts[1];
								// Clean first email of quotes and commas
								const firstEmail = parts[2].replace(/["]/g, '').replace(/,+$/, '').trim();
								console.log(`New company: ${currentCompany}, First email: ${firstEmail}`);
								emails = [];
								if (validateEmail(firstEmail)) {
									emails.push(firstEmail);
								}
							} else {
								// Just company name
								currentCompany = line.replace(/"/g, '').trim();
								console.log(`New company with no email: ${currentCompany}`);
								emails = [];
							}
						} else if (line && !line.startsWith('"')) {
							// This is a continuation email line or just a standalone email
							const cleanEmail = line.replace(/["]/g, '').replace(/,+$/, '').trim();
							console.log(`Potential email line: ${cleanEmail}`);
							if (cleanEmail && validateEmail(cleanEmail)) {
								emails.push(cleanEmail);
								console.log(`Added email: ${cleanEmail}`);
							}
						}
						i++;
					}

					// Add the last company
					if (currentCompany && emails.length > 0) {
						companyEmails.push({
							name: currentCompany,
							emails: emails
						});
						console.log(`Added final company: ${currentCompany} with ${emails.length} emails`);
					}

					console.log("Parsed company emails:", companyEmails);

					// Convert to recipients format
					const newRecipients = companyEmails.map(company => {
						const validEmails = company.emails.filter(email => validateEmail(email));
						return {
							name: company.name,
							email: validEmails.join(', '),
							emails: validEmails
						};
					}).filter(r => r.emails.length > 0);

					// Add debug output for troubleshooting
					console.log("Final parsed recipients:", newRecipients);

					if (newRecipients.length > 0) {
						setEmailData((prev) => ({
							...prev,
							recipients: [...prev.recipients, ...newRecipients],
						}));
						recipientsAdded = newRecipients.length;
					} else {
						// Fallback to original parser if no multiline entries are found
						const lines = content.split('\n');
						const newRecipients = lines
							.filter(line => line.trim())
							.map(line => {
								// Enhanced CSV parsing to handle quoted fields
								let name, email;

								// Check if there are quoted fields (for emails with commas)
								if (line.includes('"')) {
									// Match for pattern: name,"email1, email2, etc"
									// Use a more flexible regex that will work even with spaces around the quotes
									const match = line.match(/(.*?),\s*"(.*?)"\s*$/);
									if (match && match.length >= 3) {
										name = match[1].trim();
										email = match[2].trim();
										console.log('Quoted field detected:', { line, name, email });
									} else {
										// Fallback to simple split if quote format is incorrect
										const parts = line.split(',');
										name = parts[0].trim();
										// Join remaining parts as email (in case there are unquoted commas in email)
										email = parts.slice(1).join(',').trim();
										// Remove any lingering quotes
										email = email.replace(/"/g, '');
										console.log('Quote format incorrect, using fallback:', { line, name, email });
									}
								} else {
									// Simple comma split for regular entries
									const parts = line.split(',');
									name = parts[0].trim();
									// Join remaining parts as email (in case there are commas in email)
									email = parts.slice(1).join(',').trim();
									console.log('Regular entry:', { line, name, email });
								}

								// Validate and process multiple email addresses
								const { valid, emails } = validateMultipleEmails(email || '');
								console.log('Email validation result:', { email, valid, emails });
								return {
									name,
									email: email || '',
									emails: valid ? emails : (validateEmail(email) ? [email] : [])
								};
							})
							.filter(({ name, emails }) => name && emails.length > 0);

						if (newRecipients.length > 0) {
							setEmailData((prev) => ({
								...prev,
								recipients: [...prev.recipients, ...newRecipients],
							}));
							recipientsAdded = newRecipients.length;
						} else {
							alert('No valid recipients found in the file. Please check the format.');
							return;
						}
					}
				}

				// Show import success alert
				if (recipientsAdded > 0) {
					setImportAlert(true);
					setTimeout(() => setImportAlert(false), 5000); // Hide after 5 seconds
				}
			} catch (error) {
				console.error('Error parsing file:', error);
				alert('Error parsing file. Please check the format.');
			}
		};

		reader.readAsText(file);
	};

	// Function to download sample CSV
	const downloadSampleCSV = () => {
		const csvContent =
			`John Doe,john@example.com
Jane Smith,"jane@example.com,jane.work@company.com"
Alex Johnson,"alex@example.com;alex.personal@gmail.com;alex.work@company.com"`;

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'sample_recipients.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Box>
			<Typography variant="h6" gutterBottom>
				Add Recipients
			</Typography>

			{/* Import alert notification */}
			<Collapse in={importAlert}>
				<Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportAlert(false)}>
					Recipients imported successfully! Multiple email addresses have been properly detected and will be used as BCC recipients. You can edit any recipient by clicking the edit icon.
				</Alert>
			</Collapse>

			<Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
				<Typography variant="body2" sx={{ mb: 1 }}>
					Add recipients individually or upload a CSV/JSON file with the format:
					<br />
					CSV (single email): <strong>name,email</strong> (one per line)
					<br />
					CSV (multiple emails): <strong>name,"email1@example.com,email2@example.com"</strong> (make sure to use quotes)
					<br />
					<strong>Important:</strong> When using multiple emails in CSV, the entire email list must be enclosed in quotes.
					<br />
					JSON: array of objects with name and email properties
					<br /><br />
					You can add multiple email addresses per recipient by separating them with commas or semicolons.
					<br />
					Example: john@example.com, john.work@example.com
					<br /><br />
					The first email will be the primary recipient and additional emails will be sent as BCC.
					<br /><br />
					After importing, you can edit any recipient by clicking the edit icon.
				</Typography>

				<Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 2 }}>
					<Button
						variant="outlined"
						component="label"
					>
						Upload File
						<input
							type="file"
							accept=".csv,.json"
							hidden
							onChange={handleFileUpload}
						/>
					</Button>

					<Button
						variant="outlined"
						startIcon={<DownloadIcon />}
						onClick={downloadSampleCSV}
					>
						Download Sample CSV
					</Button>

					<Typography variant="body2" sx={{ alignSelf: 'center' }}>
						Accepted formats: .csv, .json
					</Typography>
				</Box>
			</Paper>

			<Box sx={{ mb: 3 }}>
				<TextField
					label="Name"
					variant="outlined"
					fullWidth
					margin="normal"
					value={name}
					onChange={(e) => setName(e.target.value)}
					error={!!nameError}
					helperText={nameError}
				/>
				<TextField
					label="Email"
					variant="outlined"
					fullWidth
					margin="normal"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					error={!!emailError}
					helperText={emailError || "For multiple emails, separate them with commas or semicolons"}
					placeholder="email@example.com, alternate@example.com"
				/>
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={handleAddRecipient}
					sx={{ mt: 2 }}
				>
					Add Recipient
				</Button>
			</Box>

			<Typography variant="h6" gutterBottom>
				Recipients List ({recipients.length})
			</Typography>

			{recipients.length > 0 ? (
				<Paper variant="outlined" sx={{ mb: 3 }}>
					<List>
						{recipients.map((recipient, index) => (
							<React.Fragment key={index}>
								<ListItem>
									<ListItemText
										primary={recipient.name}
										secondary={
											<Tooltip title={recipient.email} placement="bottom-start">
												<span>{recipient.email}</span>
											</Tooltip>
										}
									/>
									<ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
										<IconButton
											edge="end"
											aria-label="edit"
											onClick={() => handleEditRecipient(index)}
											sx={{ mr: 1 }}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											edge="end"
											aria-label="delete"
											onClick={() => handleRemoveRecipient(index)}
										>
											<DeleteIcon />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
								{index < recipients.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
				</Paper>
			) : (
				<Typography variant="body2" color="textSecondary">
					No recipients added yet.
				</Typography>
			)}

			{/* Edit Recipient Dialog */}
			<Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
				<DialogTitle>Edit Recipient</DialogTitle>
				<DialogContent>
					<TextField
						label="Name"
						variant="outlined"
						fullWidth
						margin="normal"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						error={!!editNameError}
						helperText={editNameError}
					/>
					<TextField
						label="Email"
						variant="outlined"
						fullWidth
						margin="normal"
						value={editEmail}
						onChange={(e) => setEditEmail(e.target.value)}
						error={!!editEmailError}
						helperText={editEmailError || "For multiple emails, separate them with commas or semicolons"}
						placeholder="email@example.com, alternate@example.com"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseEditDialog}>Cancel</Button>
					<Button onClick={handleSaveEdit} variant="contained" color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default RecipientsForm; 