import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Grid from '@mui/material/Grid';

interface AnalysisFormProps {
  onSubmit: (data: any) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [analysisType, setAnalysisType] = useState('abc-xyz');
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [dataSource, setDataSource] = useState('database');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  
  // Mock data for categories and warehouses
  const categories = [
    'Electronics', 'Furniture', 'Office Supplies', 'Kitchen', 'Bathroom', 
    'Outdoor', 'Tools', 'Clothing', 'Books', 'Sports'
  ];
  
  const warehouses = [
    'Main Warehouse', 'North Distribution Center', 'South Distribution Center', 
    'East Warehouse', 'West Warehouse', 'Central Storage'
  ];
  
  const handleCategoryToggle = (category: string) => {
    const currentIndex = selectedCategories.indexOf(category);
    const newSelectedCategories = [...selectedCategories];
    
    if (currentIndex === -1) {
      newSelectedCategories.push(category);
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }
    
    setSelectedCategories(newSelectedCategories);
  };
  
  const handleWarehouseToggle = (warehouse: string) => {
    const currentIndex = selectedWarehouses.indexOf(warehouse);
    const newSelectedWarehouses = [...selectedWarehouses];
    
    if (currentIndex === -1) {
      newSelectedWarehouses.push(warehouse);
    } else {
      newSelectedWarehouses.splice(currentIndex, 1);
    }
    
    setSelectedWarehouses(newSelectedWarehouses);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      analysisType,
      startDate,
      endDate,
      dataSource,
      includeInactive,
      selectedCategories,
      selectedWarehouses
    };
    
    onSubmit(formData);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Analysis Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Q2 2025 Inventory Analysis"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Analysis Type</InputLabel>
                    <Select
                      value={analysisType}
                      label="Analysis Type"
                      onChange={(e) => setAnalysisType(e.target.value)}
                    >
                      <MenuItem value="abc">ABC Analysis</MenuItem>
                      <MenuItem value="xyz">XYZ Analysis</MenuItem>
                      <MenuItem value="abc-xyz">ABC-XYZ Analysis</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
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
                      <MenuItem value="file">Imported Files</MenuItem>
                      <MenuItem value="api">External API</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeInactive}
                        onChange={(e) => setIncludeInactive(e.target.checked)}
                      />
                    }
                    label="Include Inactive Items"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Product Categories
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryToggle(category)}
                    color={selectedCategories.includes(category) ? 'primary' : 'default'}
                    variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
              
              {selectedCategories.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No categories selected. All categories will be included.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Warehouses
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {warehouses.map((warehouse) => (
                  <Chip
                    key={warehouse}
                    label={warehouse}
                    onClick={() => handleWarehouseToggle(warehouse)}
                    color={selectedWarehouses.includes(warehouse) ? 'primary' : 'default'}
                    variant={selectedWarehouses.includes(warehouse) ? 'filled' : 'outlined'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
              
              {selectedWarehouses.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No warehouses selected. All warehouses will be included.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={!name}
              >
                Run Analysis
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalysisForm;
