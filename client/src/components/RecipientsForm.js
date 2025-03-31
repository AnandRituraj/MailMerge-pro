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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const RecipientsForm = ({ recipients, setEmailData }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [nameError, setNameError] = useState('');
	const [emailError, setEmailError] = useState('');

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

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target.result;

				// Try to parse as JSON first
				try {
					const jsonData = JSON.parse(content);
					if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].name && jsonData[0].email) {
						setEmailData((prev) => ({
							...prev,
							recipients: [...prev.recipients, ...jsonData],
						}));
						return;
					}
				} catch (err) {
					// Not valid JSON, continue to CSV parsing
				}

				// Parse as CSV
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
				} else {
					alert('No valid recipients found in the file. Please check the format.');
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

			<Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
				<Typography variant="body2" sx={{ mb: 1 }}>
					Add recipients individually or upload a CSV/JSON file with the format:
					<br />
					CSV: name,email (one per line)
					<br />
					JSON: array of objects with name and email properties
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
									<ListItemSecondaryAction>
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
		</Box>
	);
};

export default RecipientsForm; 