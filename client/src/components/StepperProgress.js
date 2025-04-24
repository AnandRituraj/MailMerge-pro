import React from 'react';
import { Stepper, Step, StepLabel, useMediaQuery, useTheme } from '@mui/material';

const StepperProgress = ({ activeStep, steps }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            sx={{
                py: 0.5, // Reduced padding
                px: { xs: 0, sm: 1 }, // Reduced horizontal padding on larger screens 
                '& .MuiStepLabel-label': {
                    fontSize: '0.8rem', // Smaller text for labels
                    mt: 0.5, // Reduced margin top for labels
                },
                '& .MuiStepIcon-root': {
                    fontSize: isMobile ? 18 : 22, // Smaller icons
                },
                '& .MuiStepConnector-line': {
                    minHeight: 1, // Thinner connector lines
                }
            }}
        >
            {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>
    );
};

export default StepperProgress; 