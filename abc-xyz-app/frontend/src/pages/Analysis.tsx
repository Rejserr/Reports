import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import AnalysisForm from '../components/analysis/AnalysisForm';
import ResultsTable from '../components/analysis/ResultsTable';

const steps = ['Configure Analysis', 'Processing', 'Results'];

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleAnalysisSubmit = (data: any) => {
    setLoading(true);
    handleNext();
    
    // Simulate API call to run analysis
    setTimeout(() => {
      // Mock results data
      const mockResults = Array.from({ length: 50 }, (_, i) => ({
        item: `ITEM-${1000 + i}`,
        description: `Product ${i + 1}`,
        abc: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        xyz: ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)],
        turnover: Math.floor(Math.random() * 10000),
        quantity: Math.floor(Math.random() * 500),
        coefficient: (Math.random() * 100).toFixed(2)
      }));
      
      setResults(mockResults);
      setLoading(false);
      handleNext();
    }, 3000);
  };
  const handleSaveResults = () => {
    // In a real app, you would call an API to save the results
    console.log('Saving analysis results:', results);
    
    // Navigate to the results page with the analysis ID
    navigate('/analyses/123');
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <AnalysisForm onSubmit={handleAnalysisSubmit} />;
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Running Analysis...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              This may take a few moments
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            {results && <ResultsTable data={results} />}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        New Analysis
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && activeStep !== 1 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Back
            </Button>
          )}
          
          {activeStep === 2 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveResults}
            >
              Save Results
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analysis;