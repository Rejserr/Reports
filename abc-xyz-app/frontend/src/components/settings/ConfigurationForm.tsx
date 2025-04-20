import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  Divider,
  Grid,
  Slider,
  Alert
} from '@mui/material';

interface ConfigurationFormProps {
  onSave: (config: any) => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSave }) => {
  const [abcThresholds, setAbcThresholds] = useState<number[]>([80, 95]);
  const [xyzThresholds, setXyzThresholds] = useState<number[]>([20, 40]);
  const [defaultDateRange, setDefaultDateRange] = useState('last12months');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [dataSource, setDataSource] = useState('database');
  const [connectionString, setConnectionString] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleAbcThresholdsChange = (event: Event, newValue: number | number[]) => {
    setAbcThresholds(newValue as number[]);
  };
  
  const handleXyzThresholdsChange = (event: Event, newValue: number | number[]) => {
    setXyzThresholds(newValue as number[]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = {
      abcThresholds,
      xyzThresholds,
      defaultDateRange,
      autoRefresh,
      refreshInterval,
      dataSource,
      connectionString
    };
    
    onSave(config);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Analysis Configuration
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuration saved successfully!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              ABC Classification Thresholds
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={abcThresholds}
                onChange={handleAbcThresholdsChange}
                valueLabelDisplay="on"
                min={0}
                max={100}
                step={1}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">A: 0-{abcThresholds[0]}%</Typography>
                <Typography variant="body2">B: {abcThresholds[0]}-{abcThresholds[1]}%</Typography>
                <Typography variant="body2">C: {abcThresholds[1]}-100%</Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              XYZ Classification Thresholds (Coefficient of Variation)
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={xyzThresholds}
                onChange={handleXyzThresholdsChange}
                valueLabelDisplay="on"
                min={0}
                max={100}
                step={1}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">X: 0-{xyzThresholds[0]}%</Typography>
                <Typography variant="body2">Y: {xyzThresholds[0]}-{xyzThresholds[1]}%</Typography>
                <Typography variant="body2">Z: {'>'}{xyzThresholds[1]}%</Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Default Date Range</InputLabel>
              <Select
                value={defaultDateRange}
                label="Default Date Range"
                onChange={(e) => setDefaultDateRange(e.target.value)}
              >
                <MenuItem value="last3months">Last 3 Months</MenuItem>
                <MenuItem value="last6months">Last 6 Months</MenuItem>
                <MenuItem value="last12months">Last 12 Months</MenuItem>
                <MenuItem value="ytd">Year to Date</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Data Source</InputLabel>
              <Select
                value={dataSource}
                label="Data Source"
                onChange={(e) => setDataSource(e.target.value)}
              >
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="file">File Import</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {dataSource === 'database' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Connection String"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto-refresh dashboard"
              />
            </FormGroup>
          </Grid>
          
          {autoRefresh && (
            <Grid item xs={12} md={6}>
              <Typography id="refresh-interval-slider" gutterBottom>
                Refresh Interval (minutes)
              </Typography>
              <Slider
                value={refreshInterval}
                onChange={(e, value) => setRefreshInterval(value as number)}
                aria-labelledby="refresh-interval-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={5}
                max={60}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Save Configuration
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ConfigurationForm;
