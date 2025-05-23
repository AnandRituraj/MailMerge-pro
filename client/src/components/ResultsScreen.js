import React from 'react';
import {
	Box,
	Typography,
	Paper,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ResultsScreen = ({ results, onReset }) => {
	if (!results) {
		return (
			<Box sx={{ textAlign: 'center', py: 4 }}>
				<Typography variant="h6" color="textSecondary">
					No results available
				</Typography>
				<Button
					variant="outlined"
					startIcon={<RestartAltIcon />}
					onClick={onReset}
					sx={{
						mt: 2,
						width: { xs: '100%', sm: 'auto' }
					}}
				>
					Start Over
				</Button>
			</Box>
		);
	}

	const { success, message, results: emailResults } = results;

	return (
		<Box>
			<Typography variant="h6" gutterBottom>
				Email Sending Results
			</Typography>

			<Paper
				elevation={0}
				sx={{
					p: { xs: 2, sm: 3 },
					mb: 3,
					bgcolor: success ? '#e8f5e9' : '#ffebee',
					borderRadius: 2
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
					{success ? (
						<CheckCircleIcon color="success" sx={{ mr: 1 }} />
					) : (
						<ErrorIcon color="error" sx={{ mr: 1 }} />
					)}
					<Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
						{success ? 'Success!' : 'Error'}
					</Typography>
				</Box>
				<Typography variant="body1">
					{message}
				</Typography>
			</Paper>

			{emailResults && emailResults.length > 0 && (
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" gutterBottom>
						Sent Emails ({emailResults.length})
					</Typography>
					<Paper variant="outlined">
						<List sx={{
							maxHeight: { xs: '300px', sm: '400px' },
							overflow: 'auto'
						}}>
							{emailResults.map((result, index) => (
								<React.Fragment key={index}>
									<ListItem sx={{
										py: { xs: 2, sm: 1 },
										flexDirection: { xs: 'column', sm: 'row' },
										alignItems: { xs: 'flex-start', sm: 'center' }
									}}>
										<ListItemIcon sx={{
											minWidth: { xs: '32px', sm: '56px' },
											mb: { xs: 1, sm: 0 }
										}}>
											{result.status === 'sent' || result.status === 'sent (BCC)' ? (
												<CheckCircleIcon color="success" />
											) : (
												<ErrorIcon color="error" />
											)}
										</ListItemIcon>
										<ListItemText
											primary={result.email}
											secondary={
												result.status === 'sent (BCC)'
													? 'Status: Sent (as BCC)'
													: `Status: ${result.status}`
											}
											primaryTypographyProps={{
												sx: { wordBreak: 'break-all' }
											}}
										/>
									</ListItem>
									{index < emailResults.length - 1 && <Divider />}
								</React.Fragment>
							))}
						</List>
					</Paper>
				</Box>
			)}

			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<Button
					variant="contained"
					color="primary"
					startIcon={<RestartAltIcon />}
					onClick={onReset}
					size="large"
					sx={{
						px: { xs: 2, sm: 4 },
						py: { xs: 1, sm: 1.5 },
						width: { xs: '100%', sm: 'auto' }
					}}
				>
					Send More Emails
				</Button>
			</Box>
		</Box>
	);
};

export default ResultsScreen; 