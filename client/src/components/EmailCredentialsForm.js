import React, { useState } from 'react';
import {
	Box,
	Typography,
	TextField,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	FormHelperText,
	Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import config from '../config';

const EmailCredentialsForm = ({ emailConfig, setEmailData }) => {
	const [email, setEmail] = useState(emailConfig?.email || '');
	const [password, setPassword] = useState(emailConfig?.password || '');
	const [service, setService] = useState(emailConfig?.service || 'gmail');
	const [errors, setErrors] = useState({});
	const [testStatus, setTestStatus] = useState(null);

	const validateForm = () => {
		const newErrors = {};
		if (!email) newErrors.email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';

		if (!password) newErrors.password = 'Password is required';

		if (!service) newErrors.service = 'Email service is required';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (validateForm()) {
			setEmailData((prev) => ({
				...prev,
				emailConfig: { email, password, service },
			}));
		}
	};

	const handleTestConnection = async () => {
		if (!validateForm()) return;

		setTestStatus({ status: 'testing', message: 'Testing connection...' });

		try {
			const response = await fetch(`${config.API_URL}/api/test-email-connection`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password, service }),
			});

			const data = await response.json();

			if (response.ok) {
				setTestStatus({ status: 'success', message: data.message });
			} else {
				setTestStatus({ status: 'error', message: data.message });
			}
		} catch (error) {
			setTestStatus({
				status: 'error',
				message: 'Error testing connection: ' + error.message
			});
		}
	};

	return (
		<Box>
			<Typography variant="h6" gutterBottom>
				Email Account
			</Typography>

			<Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
				<Typography variant="body2">
					Enter your email credentials to send emails from your account.
					These credentials are only used to send emails and are not stored on our servers.
				</Typography>
			</Paper>

			<FormControl fullWidth margin="normal" error={!!errors.service}>
				<InputLabel id="email-service-label">Email Service</InputLabel>
				<Select
					labelId="email-service-label"
					value={service}
					label="Email Service"
					onChange={(e) => setService(e.target.value)}
				>
					<MenuItem value="gmail">Gmail</MenuItem>
					<MenuItem value="outlook">Outlook</MenuItem>
					<MenuItem value="yahoo">Yahoo Mail</MenuItem>
					<MenuItem value="hotmail">Hotmail</MenuItem>
				</Select>
				{errors.service && <FormHelperText>{errors.service}</FormHelperText>}
			</FormControl>

			<TextField
				label="Email Address"
				variant="outlined"
				fullWidth
				margin="normal"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				error={!!errors.email}
				helperText={errors.email}
				type="email"
			/>

			<TextField
				label="Password"
				variant="outlined"
				fullWidth
				margin="normal"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				error={!!errors.password}
				helperText={errors.password || (service === 'gmail' ? 'For Gmail, use an App Password from your Google Account' : '')}
				type="password"
			/>

			{service === 'gmail' && (
				<Paper elevation={0} sx={{ p: 2, my: 2, bgcolor: '#e8f4fd' }}>
					<Typography variant="body2">
						<strong>Gmail users:</strong> You need to use an App Password instead of your regular password.
						<ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
							<li>Enable 2-Step Verification in your Google Account</li>
							<li>Go to your Google Account → Security → App passwords</li>
							<li>Create a new app password for "Mail"</li>
							<li>Use that password here</li>
						</ol>
					</Typography>
				</Paper>
			)}

			<Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
				<Button
					variant="contained"
					color="primary"
					onClick={handleSave}
					startIcon={<LockIcon />}
				>
					Save Credentials
				</Button>

				<Button
					variant="outlined"
					onClick={handleTestConnection}
				>
					Test Connection
				</Button>
			</Box>

			{testStatus && (
				<Alert
					severity={testStatus.status === 'testing' ? 'info' : testStatus.status}
					sx={{ mt: 2 }}
				>
					{testStatus.message}
				</Alert>
			)}
		</Box>
	);
};

export default EmailCredentialsForm; 