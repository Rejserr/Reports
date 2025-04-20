import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  OutlinedInput, 
  Checkbox, 
  ListItemText, 
  CircularProgress, 
  Alert,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import { 
  getConfigurations, 
  getDefaultConfiguration, 
  Configuration 
} from '../services/configurationService';
import { 
  runAnalysis, 
  AnalysisRequest 
} from '../services/analysisService';
import { 
  getWarehouseZones, 
  getItems 
} from '../services/dataService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const NewAnalysis: React.FC = () => {
  const [analysisName, setAnalysisName] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [warehouseZones, setWarehouseZones] = useState<string[]>([]);
  const [items, setItems] = useState<Array<{ ItemCode: string; ItemName: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Dohvaćanje konfiguracija, zona skladišta i artikala
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      setError(null);
      
      try {
        // Dohvaćanje konfiguracija
        const configsData = await getConfigurations();
        setConfigurations(configsData);
        
        // Dohvaćanje zadane konfiguracije
        const defaultConfig = await getDefaultConfiguration();
        if (defaultConfig) {
          setSelectedConfig(defaultConfig.config_id);
        } else if (configsData.length > 0) {
          setSelectedConfig(configsData[0].config_id);
        }
        
        // Dohvaćanje zona skladišta
        const zonesData = await getWarehouseZones();
        setWarehouseZones(zonesData);
        
        // Dohvaćanje artikala
        const itemsData = await getItems();
        setItems(itemsData);
        
        setDataLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Došlo je do greške prilikom dohvaćanja podataka');
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!analysisName) {
      setError('Naziv analize je obavezan');
      return;
    }
    
    if (!selectedConfig) {
      setError('Odabir konfiguracije je obavezan');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const request: AnalysisRequest = {
        analysis_name: analysisName,
        config_id: selectedConfig,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined,
        warehouse_zones: selectedZones.length > 0 ? selectedZones : undefined,
        item_codes: selectedItems.length > 0 ? selectedItems : undefined
      };
      
      const result = await runAnalysis(request);
      
      setSuccess('Analiza uspješno pokrenuta');
      setLoading(false);
      
      // Preusmjeravanje na stranicu s rezultatima
      setTimeout(() => {
        navigate(`/analysis/${result.result_id}`);
      }, 1500);
    } catch (err) {
      console.error('Error running analysis:', err);
      setError('Došlo je do greške prilikom pokretanja analize');
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Nova ABC-XYZ analiza
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Naziv analize"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Konfiguracija</InputLabel>
                    <Select
                      value={selectedConfig || ''}
                      onChange={(e) => setSelectedConfig(e.target.value as number)}
                      label="Konfiguracija"
                    >
                      {configurations.map((config) => (
                        <MenuItem key={config.config_id} value={config.config_id}>
                          {config.config_name}
                          {config.is_default && " (Zadano)"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Početni datum"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    disabled={loading}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Završni datum"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    disabled={loading}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Zone skladišta</InputLabel>
                    <Select
                      multiple
                      value={selectedZones}
                      onChange={(e) => setSelectedZones(e.target.value as string[])}
                      input={<OutlinedInput label="Zone skladišta" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {warehouseZones.map((zone) => (
                        <MenuItem key={zone} value={zone}>
                          <Checkbox checked={selectedZones.indexOf(zone) > -1} />
                          <ListItemText primary={zone} />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Ostavite prazno za sve zone
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Artikli</InputLabel>
                    <Select
                      multiple
                      value={selectedItems}
                      onChange={(e) => setSelectedItems(e.target.value as string[])}
                      input={<OutlinedInput label="Artikli" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {items.map((item) => (
                        <MenuItem key={item.ItemCode} value={item.ItemCode}>
                          <Checkbox checked={selectedItems.indexOf(item.ItemCode) > -1} />
                          <ListItemText 
                            primary={item.ItemCode} 
                            secondary={item.ItemName} 
                          />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Ostavite prazno za sve artikle
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/analysis')}
                      disabled={loading}
                    >
                      Odustani
                    </Button>
                    <Button 
                                           type="submit" 
                                           variant="contained"
                                           disabled={loading || !analysisName || !selectedConfig}
                                         >
                                           {loading ? <CircularProgress size={24} /> : 'Pokreni analizu'}
                                         </Button>
                                       </Box>
                                     </Grid>
                                   </Grid>
                                 </form>
                               )}
                             </Paper>
                           </Box>
                         </LocalizationProvider>
                       );
                     };
                     
                     export default NewAnalysis;
                     
