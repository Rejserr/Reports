import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAnalysesByDateRange } from '../services/analysisService';
import { useNavigate } from 'react-router-dom';

const DataByPeriod: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setMonth(new Date().getMonth() - 3)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const fetchData = async () => {
    if (!startDate || !endDate) {
      setError('Molimo odaberite oba datuma');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const data = await getAnalysesByDateRange(startDateStr, endDateStr);
      setAnalyses(data);
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError('Došlo je do greške prilikom dohvaćanja podataka');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewAnalysis = (resultId: number) => {
    navigate(`/results/${resultId}`);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pregled podataka po vremenskom periodu
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Početni datum"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: loading
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Završni datum"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: loading
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchData}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Pretraži'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Rezultati analize
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : analyses.length === 0 ? (
            <Alert severity="info">
              Nema podataka za odabrani period
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Naziv analize</TableCell>
                      <TableCell>Datum analize</TableCell>
                      <TableCell>Broj artikala</TableCell>
                      <TableCell>ABC distribucija</TableCell>
                      <TableCell>XYZ distribucija</TableCell>
                      <TableCell>Akcije</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyses
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((analysis) => (
                        <TableRow key={analysis.result_id}>
                          <TableCell>{analysis.analysis_name}</TableCell>
                          <TableCell>
                            {new Date(analysis.analysis_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{analysis.total_items}</TableCell>
                          <TableCell>
                            A: {analysis.abc_distribution.A}, 
                            B: {analysis.abc_distribution.B}, 
                            C: {analysis.abc_distribution.C}
                          </TableCell>
                          <TableCell>
                            X: {analysis.xyz_distribution.X}, 
                            Y: {analysis.xyz_distribution.Y}, 
                            Z: {analysis.xyz_distribution.Z}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewAnalysis(analysis.result_id)}
                            >
                              Pregledaj
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={analyses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Redova po stranici:"
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DataByPeriod;