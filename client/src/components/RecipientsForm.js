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

					let companyEmails = [];

					// Find multiline email groups - pattern is quotes around company name, then first email with trailing comma, then multiple lines of just emails
					const lines = content2.split('\n');
					let currentCompany = null;
					let emails = [];
					let i = 0;
					let processingMultilineEmails = false;

					while (i < lines.length) {
						const line = lines[i].trim();

						// If we find a line that appears to be just an email
						if (line.includes('@') && !line.includes(',@') && !line.startsWith('"')) {
							// This is likely an email line without a company
							// Clean email address
							const cleanEmail = line.trim().replace(/,+$/, '').replace(/"+$/, '');
							if (currentCompany && validateEmail(cleanEmail)) {
								emails.push(cleanEmail);
								processingMultilineEmails = true;
							}
							i++;
							continue;
						}

						// If we hit a new company line but we were processing multiline emails
						if (line.startsWith('"') && processingMultilineEmails) {
							// Save the current company before moving on
							if (currentCompany && emails.length > 0) {
								companyEmails.push({
									name: currentCompany,
									emails: emails
								});
							}

							// Reset for new company
							emails = [];
							currentCompany = null;
							processingMultilineEmails = false;
						}

						// Try to match standard CSV format: "Company Name",email@example.com
						// or multiline format: "Company Name",firstemail@example.com,
						const match = line.match(/^"([^"]+)"\s*,\s*([^,\s]+@[^,\s]+)/);
						if (match) {
							// If we already had a company in progress, save it first
							if (currentCompany && emails.length > 0) {
								companyEmails.push({
									name: currentCompany,
									emails: emails
								});
							}

							// Start a new company
							currentCompany = match[1].trim();
							const firstEmail = match[2].trim().replace(/,+$/, '');
							emails = [firstEmail];
							i++;
							continue;
						}

						// Check for company name only: "Company Name",
						const nameOnlyMatch = line.match(/^"([^"]+)"\s*,\s*$/);
						if (nameOnlyMatch) {
							currentCompany = nameOnlyMatch[1].trim();
							emails = [];
							i++;
							continue;
						}

						// Check for any line that might be an email (no quotes, but has @ symbol)
						if (line.includes('@') && !line.startsWith('"')) {
							const cleanEmail = line.trim().replace(/,+$/, '');
							if (validateEmail(cleanEmail)) {
								emails.push(cleanEmail);
							}
						}

						i++;
					}

					// Add the last company if we have one
					if (currentCompany && emails.length > 0) {
						companyEmails.push({
							name: currentCompany,
							emails: emails
						});
					}

					// Convert to recipients format
					if (companyEmails.length > 0) {
						const newRecipients = companyEmails.map(company => {
							const { emails: validEmails } = validateMultipleEmails(company.emails.join(','));
							return {
								name: company.name,
								email: company.emails.join(', '),
								emails: validEmails
							};
						});

						// Add to state
						setEmailData((prev) => ({
							...prev,
							recipients: [...prev.recipients, ...newRecipients],
						}));
						recipientsAdded = newRecipients.length;
						setImportAlert(true);
					}
				}

				// If no recipients were added, try standard CSV parsing
				if (recipientsAdded === 0) {
					const lines = content.split('\n').filter(line => line.trim());
					const newRecipients = [];

					for (const line of lines) {
						// Skip header lines
						if (line.toLowerCase().includes('name') && line.toLowerCase().includes('email')) continue;

						// Check for quoted fields - format: "Name with, comma",email@example.com
						const quotedMatch = line.match(/"([^"]+)"\s*,\s*(.+)/);
						if (quotedMatch) {
							const name = quotedMatch[1].trim();
							let email = quotedMatch[2].trim();

							// Handle quoted email values too: "Name","email1,email2"
							if (email.startsWith('"') && email.endsWith('"')) {
								email = email.substring(1, email.length - 1);
							}

							// If format is incorrect, fallback to simpler parsing
							if (!name || !email) {
								const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
								if (parts.length >= 2) {
									newRecipients.push({
										name: parts[0],
										email: parts.slice(1).join(', ')
									});
								}
							} else {
								newRecipients.push({ name, email });
							}
						} else {
							// Simple CSV format: name,email
							const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
							if (parts.length >= 2) {
								newRecipients.push({
									name: parts[0],
									email: parts.slice(1).join(', ')
								});
							}
						}
					}

					// Process recipients to add emails array
					const processedRecipients = newRecipients.map(item => {
						const { valid, emails: validEmails } = validateMultipleEmails(item.email);
						return {
							...item,
							emails: valid ? validEmails : []
						};
					});

					// Add to state
					if (processedRecipients.length > 0) {
						setEmailData((prev) => ({
							...prev,
							recipients: [...prev.recipients, ...processedRecipients],
						}));
						recipientsAdded = processedRecipients.length;
						setImportAlert(true);
					}
				}

				// Show import success alert
				if (recipientsAdded > 0) {
					setImportAlert(true);
					setTimeout(() => setImportAlert(false), 5000); // Hide after 5 seconds
				}
			} catch (error) {
				alert(`Error parsing file: ${error.message}`);
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
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 2,
					borderRadius: 2,
					backgroundColor: 'rgba(20, 20, 35, 0.4)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
					backdropFilter: 'blur(8px)',
				}}
			>
				<Typography variant="body2" sx={{ mb: 1.5 }}>
					Add recipients for your email campaign. You can add recipients manually or import from a CSV/JSON file.
					You can add multiple email addresses for a single recipient by separating them with commas or semicolons.
				</Typography>

				<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 1.5 }}>
					<TextField
						label="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						error={!!nameError}
						helperText={nameError}
						fullWidth
						size="small"
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 2
							}
						}}
					/>
					<TextField
						label="Email Address(es)"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						error={!!emailError}
						helperText={emailError}
						fullWidth
						size="small"
						placeholder="Separate multiple emails with commas"
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 2
							}
						}}
					/>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleAddRecipient}
						startIcon={<AddIcon />}
						size="small"
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
						Add Recipient
					</Button>

					<Box sx={{ display: 'flex', gap: 1.5 }}>
						<Button
							variant="outlined"
							color="primary"
							component="label"
							size="small"
							sx={{
								borderRadius: 2,
								borderWidth: '1.5px',
								'&:hover': {
									borderWidth: '1.5px',
								}
							}}
						>
							Import CSV/JSON
							<input
								type="file"
								accept=".csv,.json"
								style={{ display: 'none' }}
								onChange={handleFileUpload}
							/>
						</Button>

						<Button
							variant="outlined"
							color="secondary"
							onClick={downloadSampleCSV}
							startIcon={<DownloadIcon />}
							size="small"
							sx={{
								borderRadius: 2,
								borderWidth: '1.5px',
								'&:hover': {
									borderWidth: '1.5px',
									backgroundColor: 'rgba(159, 117, 255, 0.08)'
								}
							}}
						>
							Download Sample
						</Button>
					</Box>
				</Box>
			</Paper>

			<Collapse in={importAlert}>
				<Alert
					severity="success"
					sx={{ mb: 2 }}
					onClose={() => setImportAlert(false)}
				>
					Recipients imported successfully!
				</Alert>
			</Collapse>

			<Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
				Recipient List ({recipients.length})
			</Typography>

			{recipients.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 1.5,
						borderRadius: 2,
						backgroundColor: 'rgba(20, 20, 35, 0.4)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						textAlign: 'center',
					}}
				>
					<Typography variant="body2" color="text.secondary">
						No recipients added yet. Add recipients manually or import from a file.
					</Typography>
				</Paper>
			) : (
				<Paper
					elevation={0}
					sx={{
						borderRadius: 2,
						backgroundColor: 'rgba(25, 25, 40, 0.5)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						overflow: 'hidden',
						maxHeight: '200px', // Limit height
						overflowY: 'auto' // Add scroll for many recipients
					}}
				>
					<List disablePadding dense>
						{recipients.map((recipient, index) => (
							<React.Fragment key={index}>
								{index > 0 && <Divider />}
								<ListItem
									sx={{
										py: 1,
										px: 2,
										'&:hover': {
											backgroundColor: 'rgba(255, 255, 255, 0.03)',
										},
									}}
								>
									<ListItemText
										primary={
											<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
												{recipient.name}
											</Typography>
										}
										secondary={
											<Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
												{recipient.email}
											</Typography>
										}
									/>
									<ListItemSecondaryAction>
										<Tooltip title="Edit Recipient">
											<IconButton edge="end" onClick={() => handleEditRecipient(index)} sx={{ mr: 1 }}>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete Recipient">
											<IconButton edge="end" onClick={() => handleRemoveRecipient(index)}>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</ListItemSecondaryAction>
								</ListItem>
							</React.Fragment>
						))}
					</List>
				</Paper>
			)}

			{/* Edit Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={handleCloseEditDialog}
				maxWidth="sm"
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
				<DialogTitle>Edit Recipient</DialogTitle>
				<DialogContent dividers>
					<TextField
						label="Name"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						error={!!editNameError}
						helperText={editNameError}
						fullWidth
						margin="normal"
						sx={{
							mt: 1,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2
							}
						}}
					/>
					<TextField
						label="Email Address(es)"
						value={editEmail}
						onChange={(e) => setEditEmail(e.target.value)}
						error={!!editEmailError}
						helperText={editEmailError}
						fullWidth
						margin="normal"
						placeholder="Separate multiple emails with commas or semicolons"
						sx={{
							mt: 2,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2
							}
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={handleCloseEditDialog}
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
						onClick={handleSaveEdit}
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
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default RecipientsForm; 