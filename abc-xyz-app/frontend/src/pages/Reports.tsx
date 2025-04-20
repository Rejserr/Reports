import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { 
  PictureAsPdf as PdfIcon, 
  TableChart as ExcelIcon, 
  BarChart as ChartIcon 
} from '@mui/icons-material';
import { getAnalyses } from '../services/analysisService';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAnalyses();
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
  
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleViewReport = (resultId: number) => {
    navigate(`/results/${resultId}`);
  };
  
  const handleExportReport = (resultId: number, format: 'excel' | 'pdf') => {
    // Implementacija izvoza izvještaja
    console.log(`Exporting report ${resultId} as ${format}`);
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Izvještaji
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="ABC-XYZ Izvještaji" />
          <Tab label="Izvještaji po zonama" />
          <Tab label="Izvještaji po artiklima" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              {error}
            </Alert>
          ) : analyses.length === 0 ? (
            <Alert severity="info">
              Nema dostupnih izvještaja
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
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ChartIcon />}
                              onClick={() => handleViewReport(analysis.result_id)}
                              sx={{ mr: 1 }}
                            >
                              Pregledaj
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ExcelIcon />}
                              onClick={() => handleExportReport(analysis.result_id, 'excel')}
                              sx={{ mr: 1 }}
                            >
                              Excel
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PdfIcon />}
                              onClick={() => handleExportReport(analysis.result_id, 'pdf')}
                            >
                              PDF
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
                </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Izvještaji po zonama skladišta prikazuju distribuciju artikala i prometa po različitim zonama.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribucija artikala po zonama
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ovaj izvještaj prikazuje broj artikala u svakoj zoni skladišta, razvrstanih po ABC i XYZ klasama.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<PdfIcon />}
                      fullWidth
                    >
                      Generiraj izvještaj
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Promet po zonama
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ovaj izvještaj prikazuje ukupni promet i količine po zonama skladišta u odabranom periodu.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<PdfIcon />}
                      fullWidth
                    >
                      Generiraj izvještaj
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Izvještaji po artiklima prikazuju detaljne podatke o pojedinačnim artiklima ili grupama artikala.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top artikli po prometu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ovaj izvještaj prikazuje artikle s najvećim prometom u odabranom periodu.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<PdfIcon />}
                      fullWidth
                    >
                      Generiraj izvještaj
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Artikli koji zahtijevaju pažnju
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ovaj izvještaj prikazuje artikle s neobičnim obrascima potražnje (npr. AZ kategorija).
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<PdfIcon />}
                      fullWidth
                    >
                      Generiraj izvještaj
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;
