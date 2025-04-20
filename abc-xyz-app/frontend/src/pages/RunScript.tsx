import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  PlayArrow as RunIcon, 
  // Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const RunScript: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<{type: 'info' | 'warning' | 'error', message: string}[]>([]);
  
  // Form state
  const [scriptName, setScriptName] = useState('ABC_XYZ_Analysis');
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setMonth(new Date().getMonth() - 3)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [outputDir, setOutputDir] = useState('C:\\Users\\mladen.lackovic\\Documents\\Reports\\2025\\ABC_XYZ_Results');
  
  const steps = ['Konfiguracija', 'Izvršavanje', 'Rezultati'];
  
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate form
      if (!startDate || !endDate) {
        setError('Molimo odaberite oba datuma');
        return;
      }
      
      if (startDate > endDate) {
        setError('Početni datum mora biti prije završnog datuma');
        return;
      }
      
      setError(null);
      setActiveStep(1);
      runScript();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReset = () => {
    setActiveStep(0);
    setLogs([]);
    setSuccess(null);
    setError(null);
  };
  
  const runScript = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setLogs([]);
    
    // Simulate script execution
    addLog('info', 'Pokretanje ABC-XYZ analize...');
    
    setTimeout(() => {
      addLog('info', 'Povezivanje na SQL Server...');
    }, 1000);
    
    setTimeout(() => {
      addLog('info', 'Uspješno povezivanje na bazu.');
    }, 2000);
    
    setTimeout(() => {
      addLog('info', 'Učitavanje podataka iz baze...');
    }, 3000);
    
    setTimeout(() => {
      addLog('info', 'Učitano 5432 redaka podataka.');
    }, 5000);
    
    setTimeout(() => {
      addLog('info', 'Dostupne kolone u podacima: Artikl, Datum pikiranja, Količina pikiranja, Naziv artikla, Vrsta isporuke, Zona');
    }, 6000);
    
    setTimeout(() => {
      addLog('info', 'Konverzija Datum pikiranja u datetime format...');
    }, 7000);
    
    setTimeout(() => {
      addLog('info', 'Konverzija datuma uspješna.');
    }, 8000);
    
    setTimeout(() => {
      addLog('info', 'Pronađeno 12 jedinstvenih mjesečnih perioda.');
    }, 9000);
    
    setTimeout(() => {
      addLog('info', 'Pronađeno 1245 jedinstvenih artikala.');
    }, 10000);
    
    setTimeout(() => {
      addLog('info', 'Kreiranje mjesečnih tablica...');
    }, 11000);
    
    setTimeout(() => {
      addLog('info', 'Izvođenje ABC analize...');
    }, 12000);
    
    setTimeout(() => {
      addLog('info', 'Izvođenje XYZ analize...');
    }, 14000);
    
    setTimeout(() => {
      addLog('info', 'Kombiniranje ABC i XYZ analiza...');
    }, 16000);
    
    setTimeout(() => {
      addLog('info', 'Kreiranje konačne mjesečne tablice...');
    }, 18000);
    
    setTimeout(() => {
      addLog('info', 'Spremanje rezultata...');
    }, 20000);
    
    setTimeout(() => {
      addLog('info', `Analiza završena! Rezultati spremljeni u ${outputDir}`);
      setLoading(false);
      setSuccess('ABC-XYZ analiza uspješno izvršena');
      setActiveStep(2);
    }, 22000);
  };
  
  const addLog = (type: 'info' | 'warning' | 'error', message: string) => {
    setLogs((prevLogs) => [...prevLogs, { type, message }]);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pokretanje ABC-XYZ skripte
      </Typography>
      
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
                        <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  
                  {activeStep === 0 ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Konfiguracija skripte
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Naziv analize"
                            value={scriptName}
                            onChange={(e) => setScriptName(e.target.value)}
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
                              slotProps={{ textField: { fullWidth: true, required: true } }}
                              disabled={loading}
                            />
                          </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Završni datum"
                              value={endDate}
                              onChange={(newValue) => setEndDate(newValue)}
                              slotProps={{ textField: { fullWidth: true, required: true } }}
                              disabled={loading}
                            />
                          </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Izlazni direktorij"
                            value={outputDir}
                            onChange={(e) => setOutputDir(e.target.value)}
                            disabled={loading}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <FormControl fullWidth disabled={loading}>
                            <InputLabel id="config-select-label">Konfiguracija analize</InputLabel>
                            <Select
                              labelId="config-select-label"
                              id="config-select"
                              value="default"
                              label="Konfiguracija analize"
                            >
                              <MenuItem value="default">Standardna konfiguracija</MenuItem>
                              <MenuItem value="seasonal">Sezonska konfiguracija</MenuItem>
                              <MenuItem value="custom">Prilagođena konfiguracija</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : activeStep === 1 ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Izvršavanje skripte
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" gutterBottom>
                          Skripta se izvršava s sljedećim parametrima:
                        </Typography>
                        <Typography variant="body2">
                          <strong>Naziv analize:</strong> {scriptName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Početni datum:</strong> {startDate?.toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Završni datum:</strong> {endDate?.toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Izlazni direktorij:</strong> {outputDir}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Log izvršavanja:
                      </Typography>
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          maxHeight: '300px', 
                          overflow: 'auto',
                          bgcolor: 'grey.100'
                        }}
                      >
                        <List dense>
                          {logs.map((log, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {log.type === 'info' && <InfoIcon color="info" />}
                                {log.type === 'warning' && <WarningIcon color="warning" />}
                                {log.type === 'error' && <ErrorIcon color="error" />}
                              </ListItemIcon>
                              <ListItemText 
                                primary={log.message} 
                                primaryTypographyProps={{ 
                                  fontFamily: 'monospace',
                                  fontSize: '0.9rem'
                                }} 
                              />
                            </ListItem>
                          ))}
                          {loading && (
                            <ListItem>
                              <ListItemIcon>
                                <CircularProgress size={20} />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Izvršavanje u tijeku..." 
                                primaryTypographyProps={{ 
                                  fontFamily: 'monospace',
                                  fontSize: '0.9rem'
                                }} 
                              />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Rezultati analize
                      </Typography>
                      
                      <Alert severity="success" sx={{ mb: 3 }}>
                        ABC-XYZ analiza uspješno izvršena! Rezultati su spremljeni u navedeni direktorij.
                      </Alert>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                ABC distribucija
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Distribucija artikala po ABC klasama
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body1">
                                  <strong>A artikli:</strong> 249 (20%)
                                </Typography>
                                <Typography variant="body1">
                                  <strong>B artikli:</strong> 373 (30%)
                                </Typography>
                                <Typography variant="body1">
                                  <strong>C artikli:</strong> 623 (50%)
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                XYZ distribucija
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Distribucija artikala po XYZ klasama
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body1">
                                  <strong>X artikli:</strong> 374 (30%)
                                </Typography>
                                <Typography variant="body1">
                                  <strong>Y artikli:</strong> 498 (40%)
                                </Typography>
                                <Typography variant="body1">
                                  <strong>Z artikli:</strong> 373 (30%)
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Generirane datoteke
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Popis generiranih datoteka
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body1">
                                  abc_xyz_monthly_breakdown.xlsx
                                </Typography>
                                <Typography variant="body1">
                                  abc_by_zone.xlsx
                                </Typography>
                                <Typography variant="body1">
                                  items_needing_attention.xlsx
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => window.open(outputDir, '_blank')}
                            >
                              Otvori direktorij s rezultatima
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                      color="inherit"
                      disabled={activeStep === 0 || loading}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Natrag
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    
                    {activeStep === steps.length - 1 ? (
                      <Button onClick={handleReset}>
                        Nova analiza
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        onClick={handleNext}
                        disabled={loading}
                        startIcon={activeStep === 0 ? (loading ? <CircularProgress size={24} /> : <RunIcon />) : undefined}
                      >
                        {activeStep === 0 ? 'Pokreni analizu' : 'Dalje'}
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            );
          };
          
          export default RunScript;
          
