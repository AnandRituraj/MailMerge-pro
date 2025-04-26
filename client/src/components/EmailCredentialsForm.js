import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	FormHelperText,
	Alert,
	useTheme,
	Card,
	CardContent,
	Divider,
	alpha
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import config from '../config';

const EmailCredentialsForm = ({ emailConfig, setEmailData }) => {
	const theme = useTheme();
	const [email, setEmail] = useState(emailConfig?.email || '');
	const [password, setPassword] = useState(emailConfig?.password || '');
	const [service, setService] = useState(emailConfig?.service || 'gmail');
	const [errors, setErrors] = useState({});
	const [testStatus, setTestStatus] = useState(null);
	const [credentialsSaved, setCredentialsSaved] = useState(emailConfig?.credentialsSaved === true);

	useEffect(() => {
		// Remove console.log that was displaying sensitive information
	}, [emailConfig, credentialsSaved]);

	useEffect(() => {
		// Reset saved state when credentials change
		if (emailConfig?.email !== email ||
			emailConfig?.password !== password ||
			emailConfig?.service !== service) {
			setCredentialsSaved(false);
			// Also update the parent component's state to reflect this change
			if (emailConfig) {
				setEmailData((prev) => ({
					...prev,
					emailConfig: {
						...prev.emailConfig,
						credentialsSaved: false
					},
				}));
			}
		}
	}, [email, password, service, emailConfig, setEmailData]);

	const validateForm = () => {
		const newErrors = {};
		if (!email) newErrors.email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';

		if (!password) newErrors.password = 'Password is required';

		if (!service) newErrors.service = 'Email service is required';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = (e) => {
		if (e) e.preventDefault();
		if (validateForm()) {
			setEmailData((prev) => ({
				...prev,
				emailConfig: { email, password, service, credentialsSaved: true },
			}));
			setCredentialsSaved(true);
			// Remove console.log that was displaying email and credentials
		}
	};

	const handleTestConnection = async (e) => {
		if (e) e.preventDefault();
		if (!validateForm()) return;

		setTestStatus({ status: 'testing', message: 'Testing connection...' });

		try {
			const response = await fetch(`${config.API_URL}/api/email/test-email-connection`, {
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
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				mb: 3,
				gap: 1
			}}>
				<EmailIcon color="primary" />
				<Typography variant="h5" component="h2" fontWeight="600">
					Email Account Setup
				</Typography>
			</Box>

			<Card
				variant="outlined"
				sx={{
					mb: 4,
					borderRadius: 2,
					background: theme.palette.mode === 'dark'
						? alpha(theme.palette.primary.main, 0.08)
						: alpha(theme.palette.primary.light, 0.07),
					border: `1px solid ${theme.palette.mode === 'dark'
						? alpha(theme.palette.primary.main, 0.2)
						: alpha(theme.palette.primary.main, 0.1)}`
				}}
			>
				<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
					<Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
						Connect Your Email Account
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Enter your email credentials to send emails from your account.
						These credentials are only used to send emails and are not stored on our servers.
					</Typography>
				</CardContent>
			</Card>

			<form onSubmit={handleSave} noValidate>
				<FormControl
					fullWidth
					margin="normal"
					error={!!errors.service}
					sx={{
						'& .MuiOutlinedInput-root': {
							bgcolor: theme.palette.mode === 'dark'
								? alpha(theme.palette.common.white, 0.05)
								: alpha(theme.palette.common.black, 0.02)
						}
					}}
				>
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
					required
					autoComplete="username email"
					inputProps={{ 'aria-label': 'Email address' }}
					InputProps={{
						sx: {
							bgcolor: theme.palette.mode === 'dark'
								? alpha(theme.palette.common.white, 0.05)
								: alpha(theme.palette.common.black, 0.02)
						}
					}}
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
					required
					autoComplete="current-password"
					inputProps={{ 'aria-label': 'Password' }}
					InputProps={{
						sx: {
							bgcolor: theme.palette.mode === 'dark'
								? alpha(theme.palette.common.white, 0.05)
								: alpha(theme.palette.common.black, 0.02)
						}
					}}
				/>

				{service === 'gmail' && (
					<Card
						variant="outlined"
						sx={{
							my: 3,
							borderRadius: 2,
							background: theme.palette.mode === 'dark'
								? alpha(theme.palette.info.main, 0.08)
								: alpha(theme.palette.info.light, 0.15),
							border: `1px solid ${theme.palette.mode === 'dark'
								? alpha(theme.palette.info.main, 0.2)
								: alpha(theme.palette.info.main, 0.2)}`
						}}
					>
						<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
							<Typography variant="subtitle2" component="div" fontWeight="600" sx={{ mb: 1.5 }}>
								Gmail users: App Password Required
							</Typography>
							<Divider sx={{ mb: 2, opacity: 0.6 }} />
							<Typography variant="body2" component="div" sx={{ pl: 1 }}>
								You need to use an App Password instead of your regular password:
								<ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
									<li>Enable 2-Step Verification in your Google Account</li>
									<li>Go to your Google Account → Security → App passwords</li>
									<li>Create a new app password for "Mail"</li>
									<li>Use that password here</li>
								</ol>
							</Typography>
						</CardContent>
					</Card>
				)}

				<Box sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					gap: 2,
					mt: 4
				}}>
					<Button
						variant="contained"
						color="primary"
						type="submit"
						startIcon={<LockIcon />}
						fullWidth={true}
						size="large"
						sx={{
							width: { xs: '100%', sm: 'auto' },
							py: 1.3,
							fontWeight: 600
						}}
					>
						Save Credentials
					</Button>

					<Button
						variant={theme.palette.mode === 'dark' ? 'outlined' : 'contained'}
						color={theme.palette.mode === 'dark' ? 'primary' : 'secondary'}
						onClick={handleTestConnection}
						disabled={!email || !password}
						fullWidth={true}
						sx={{ width: { xs: '100%', sm: 'auto' } }}
					>
						Test Connection
					</Button>
				</Box>
			</form>

			{testStatus && (
				<Alert
					severity={testStatus.status === 'success' ? 'success' : testStatus.status === 'testing' ? 'info' : 'error'}
					sx={{ mt: 3, borderRadius: 2 }}
				>
					{testStatus.message}
				</Alert>
			)}

			{credentialsSaved && (
				<Alert
					severity="success"
					sx={{ mt: 3, borderRadius: 2 }}
				>
					Email credentials saved successfully!
				</Alert>
			)}
		</Box>
	);
};

export default EmailCredentialsForm; 