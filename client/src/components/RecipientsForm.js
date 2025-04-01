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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

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
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
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
		} else if (!validateEmail(email)) {
			setEmailError('Please enter a valid email');
			isValid = false;
		}

		if (!isValid) return;

		// Add recipient to the list
		const newRecipient = { name: name.trim(), email: email.trim() };
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
		} else if (!validateEmail(editEmail)) {
			setEditEmailError('Please enter a valid email');
			isValid = false;
		}

		if (!isValid) return;

		// Update recipient in the list
		setEmailData((prev) => {
			const updatedRecipients = [...prev.recipients];
			updatedRecipients[editIndex] = {
				name: editName.trim(),
				email: editEmail.trim()
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
						setEmailData((prev) => ({
							...prev,
							recipients: [...prev.recipients, ...jsonData],
						}));
						recipientsAdded = jsonData.length;
					}
				} catch (err) {
					// Not valid JSON, continue to CSV parsing
				}

				// Parse as CSV
				if (recipientsAdded === 0) {
					const lines = content.split('\n');
					const newRecipients = lines
						.filter(line => line.trim())
						.map(line => {
							const [name, email] = line.split(',').map(item => item.trim());
							return { name, email };
						})
						.filter(({ name, email }) => name && email && validateEmail(email));

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

	return (
		<Box>
			<Typography variant="h6" gutterBottom>
				Add Recipients
			</Typography>

			{/* Import alert notification */}
			<Collapse in={importAlert}>
				<Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportAlert(false)}>
					Recipients imported successfully! You can edit any of them by clicking the edit icon.
				</Alert>
			</Collapse>

			<Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
				<Typography variant="body2" sx={{ mb: 1 }}>
					Add recipients individually or upload a CSV/JSON file with the format:
					<br />
					CSV: name,email (one per line)
					<br />
					JSON: array of objects with name and email properties
					<br /><br />
					After importing, you can edit any recipient by clicking the edit icon.
				</Typography>

				<Box sx={{ display: 'flex', mb: 2 }}>
					<Button
						variant="outlined"
						component="label"
						sx={{ mr: 2 }}
					>
						Upload File
						<input
							type="file"
							accept=".csv,.json"
							hidden
							onChange={handleFileUpload}
						/>
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
					helperText={emailError}
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
										secondary={recipient.email}
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
						helperText={editEmailError}
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