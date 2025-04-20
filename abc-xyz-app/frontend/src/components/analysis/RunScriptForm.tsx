import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  FormControl, 
  FormHelperText, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  Alert,
  Chip,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { runABCXYZScript } from '../../services/analysisService';
import { useNavigate } from 'react-router-dom';

// Tipovi za props
interface RunScriptFormProps {
  onSuccess?: (resultId: number) => void;
}

const RunScriptForm: React.FC<RunScriptFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [analysisName, setAnalysisName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [warehouseZones, setWarehouseZones] = useState<string[]>([]);
  const [itemCodes, setItemCodes] = useState<string[]>([]);
  
  // Mock data for warehouse zones (replace with API call)
  const availableZones = ['Stupnik', 'Zagreb', 'Split', 'Rijeka', 'Osijek'];
  
  // Mock data for item codes (replace with API call)
  const availableItems = ['ITEM001', 'ITEM002', 'ITEM003', 'ITEM004', 'ITEM005'];
  
  // Form validation
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');
  
  const validateForm = () => {
    let isValid = true;
    
    if (!analysisName.trim()) {
      setNameError('Naziv analize je obavezan');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!startDate || !endDate) {
      setDateError('Oba datuma su obavezna');
      isValid = false;
    } else if (startDate > endDate) {
      setDateError('Početni datum mora biti prije završnog datuma');
      isValid = false;
    } else {
      setDateError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await runABCXYZScript({
        analysis_name: analysisName,
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        warehouse_zones: warehouseZones.length > 0 ? warehouseZones : undefined,
        item_codes: itemCodes.length > 0 ? itemCodes : undefined
      });
      
      setSuccess('Analiza uspješno pokrenuta!');
      
      // Call onSuccess callback if provided
      if (onSuccess && result.result_id) {
        onSuccess(result.result_id);
      } else {
        // Navigate to results page after 2 seconds
        setTimeout(() => {
          navigate(`/results/${result.result_id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error running script:', err);
      setError('Došlo je do greške prilikom pokretanja analize. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pokretanje ABC-XYZ analize
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Naziv analize"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                error={!!nameError}
                helperText={nameError}
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Početni datum"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!dateError,
                      helperText: dateError ? dateError : '',
                      disabled: loading
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Završni datum"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!dateError,
                      disabled: loading
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={availableZones}
                value={warehouseZones}
                onChange={(_, newValue) => setWarehouseZones(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Zone skladišta (opcionalno)"
                    placeholder="Odaberite zone"
                    disabled={loading}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      disabled={loading}
                    />
                  ))
                }
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={availableItems}
                value={itemCodes}
                onChange={(_, newValue) => setItemCodes(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Šifre artikala (opcionalno)"
                    placeholder="Odaberite artikle"
                    disabled={loading}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      disabled={loading}
                    />
                  ))
                }
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {loading ? 'Pokretanje analize...' : 'Pokreni analizu'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RunScriptForm;