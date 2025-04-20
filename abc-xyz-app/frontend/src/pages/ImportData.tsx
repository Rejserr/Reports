import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  // Card, 
  // CardContent, 
  Button, 
  // TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  // Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  // Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ImportData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<{type: 'info' | 'warning' | 'error', message: string}[]>([]);
  const [importDate, setImportDate] = useState<Date | null>(new Date());
  const [importType, setImportType] = useState('picking');
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  
  const handleImport = () => {
    if (!importDate) {
      setError('Molimo odaberite datum za uvoz');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setLogs([]);
    setPreviewData(null);
    
    // Simulate import process
    addLog('info', `Pokretanje uvoza ${importType === 'picking' ? 'picking' : 'stanja'} podataka za datum: ${importDate.toLocaleDateString()}`);
    
    setTimeout(() => {
      addLog('info', 'Povezivanje na SQL Server...');
    }, 1000);
    
    setTimeout(() => {
      addLog('info', 'Uspješno povezivanje na bazu.');
    }, 2000);
    
    setTimeout(() => {
      if (importType === 'picking') {
        addLog('info', `Izvršavanje procedure [dbo].[sp_Import_Picking] s parametrima @StartDate = '${formatDate(importDate)}', @EndDate = '${formatDate(importDate)}'`);
      } else {
        addLog('info', `Izvršavanje procedure [dbo].[sp_Import_Stock] s parametrom @Date = '${formatDate(importDate)}'`);
      }
    }, 3000);
    
    setTimeout(() => {
      const randomCount = Math.floor(Math.random() * 1000) + 500;
      addLog('info', `Uvezeno ${randomCount} redaka podataka.`);
      
      // Generate sample preview data
      const sampleData = [];
      for (let i = 1; i <= 10; i++) {
        if (importType === 'picking') {
          sampleData.push({
            id: i,
            orderCode: `ORD${Math.floor(Math.random() * 10000)}`,
            taskCode: `TASK${Math.floor(Math.random() * 10000)}`,
            itemCode: `ITEM${Math.floor(Math.random() * 1000)}`,
            itemName: `Artikl ${i}`,
            quantity: Math.floor(Math.random() * 20) + 1,
            location: `LOC-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 100)}`
          });
        } else {
          sampleData.push({
            id: i,
            locationCode: `LOC-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 100)}`,
            itemCode: `ITEM${Math.floor(Math.random() * 1000)}`,
            itemName: `Artikl ${i}`,
            quantity: Math.floor(Math.random() * 100) + 1,
            unitOfMeasure: ['KOM', 'PAK', 'KUT'][Math.floor(Math.random() * 3)]
          });
        }
      }
      
      setPreviewData(sampleData);
      setSuccess(`Uvoz ${importType === 'picking' ? 'picking' : 'stanja'} podataka uspješno završen`);
      setLoading(false);
    }, 5000);
  };
  
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  const addLog = (type: 'info' | 'warning' | 'error', message: string) => {
    setLogs((prevLogs) => [...prevLogs, { type, message }]);
  };
  
  const handleRunDailyImport = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setLogs([]);
    setPreviewData(null);
    
    addLog('info', 'Pokretanje dnevnog uvoza podataka...');
    
    setTimeout(() => {
      addLog('info', 'Izvršavanje batch skripte run_daily_import.bat');
    }, 1000);
    
    setTimeout(() => {
      addLog('info', 'Batch skripta pokreće SQL skriptu daily_import_picking.sql');
    }, 2000);
    
    setTimeout(() => {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      addLog('info', `Pokretanje importa za datum: ${formatDate(yesterdayDate)}`);
    }, 3000);
    
    setTimeout(() => {
      addLog('info', 'Izvršavanje procedure [dbo].[sp_Import_Picking]');
    }, 4000);
    
    setTimeout(() => {
      const randomCount = Math.floor(Math.random() * 1000) + 500;
      addLog('info', `Uvezeno ${randomCount} redaka podataka.`);
      setSuccess('Dnevni uvoz podataka uspješno završen');
      setLoading(false);
    }, 6000);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Uvoz podataka
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
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ručni uvoz podataka
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel id="import-type-label">Vrsta uvoza</InputLabel>
                  <Select
                    labelId="import-type-label"
                    id="import-type"
                    value={importType}
                    label="Vrsta uvoza"
                    onChange={(e) => setImportType(e.target.value)}
                  >
                    <MenuItem value="picking">Picking podaci</MenuItem>
                    <MenuItem value="stock">Stanje zaliha</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Datum za uvoz"
                    value={importDate}
                    onChange={(newValue) => setImportDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                    disabled={loading}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <UploadIcon />}
                  onClick={handleImport}
                  disabled={loading}
                  fullWidth
                >
                  Pokreni uvoz
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Automatski dnevni uvoz
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Pokretanje automatskog dnevnog uvoza podataka za jučerašnji dan. Ova opcija pokreće batch skriptu koja izvršava SQL proceduru za uvoz podataka.
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              onClick={handleRunDailyImport}
              disabled={loading}
              fullWidth
            >
              Pokreni dnevni uvoz
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Log izvršavanja
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                maxHeight: '300px', 
                overflow: 'auto',
                bgcolor: 'grey.100',
                mb: 2
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
            
            {previewData && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Pregled uvezenih podataka:
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {importType === 'picking' ? (
                          <>
                            <TableCell>Nalog</TableCell>
                            <TableCell>Task</TableCell>
                            <TableCell>Artikl</TableCell>
                            <TableCell>Naziv</TableCell>
                            <TableCell align="right">Količina</TableCell>
                            <TableCell>Lokacija</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>Lokacija</TableCell>
                            <TableCell>Artikl</TableCell>
                            <TableCell>Naziv</TableCell>
                            <TableCell align="right">Količina</TableCell>
                            <TableCell>JM</TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row) => (
                        <TableRow key={row.id}>
                          {importType === 'picking' ? (
                            <>
                              <TableCell>{row.orderCode}</TableCell>
                              <TableCell>{row.taskCode}</TableCell>
                              <TableCell>{row.itemCode}</TableCell>
                              <TableCell>{row.itemName}</TableCell>
                              <TableCell align="right">{row.quantity}</TableCell>
                              <TableCell>{row.location}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{row.locationCode}</TableCell>
                              <TableCell>{row.itemCode}</TableCell>
                              <TableCell>{row.itemName}</TableCell>
                              <TableCell align="right">{row.quantity}</TableCell>
                              <TableCell>{row.unitOfMeasure}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportData;

