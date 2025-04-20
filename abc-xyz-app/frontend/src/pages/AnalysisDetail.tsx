import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Tabs,
  Tab,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalysisById, getAnalysisDetails, deleteAnalysis } from '../services/analysisService';
import ABCChart from '../components/dashboard/ABCChart';
import XYZChart from '../components/dashboard/XYZChart';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

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
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
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

const ABC_COLORS = {
  A: '#4CAF50',
  B: '#FFC107',
  C: '#F44336'
};

const XYZ_COLORS = {
  X: '#2196F3',
  Y: '#FF9800',
  Z: '#9C27B0'
};

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [abcFilter, setAbcFilter] = useState<string>('all');
  const [xyzFilter, setXyzFilter] = useState<string>('all');

  // Dohvaćanje analize
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const analysisData = await getAnalysisById(parseInt(id));
        setAnalysis(analysisData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Greška pri dohvaćanju analize');
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [id]);

  // Dohvaćanje detalja analize
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      try {
        setDetailsLoading(true);
        
        const abc = abcFilter !== 'all' ? abcFilter : undefined;
        const xyz = xyzFilter !== 'all' ? xyzFilter : undefined;
        
        const detailsData = await getAnalysisDetails(
          parseInt(id), 
          abc as 'A' | 'B' | 'C' | undefined, 
          xyz as 'X' | 'Y' | 'Z' | undefined,
          page * rowsPerPage,
          rowsPerPage
        );
        
        setDetails(detailsData);
        setDetailsLoading(false);
      } catch (err) {
        console.error('Error fetching analysis details:', err);
        setDetailsLoading(false);
      }
    };
    
    if (tabValue === 1) {
      fetchDetails();
    }
  }, [id, tabValue, page, rowsPerPage, abcFilter, xyzFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteAnalysis = async () => {
    if (!id || !window.confirm('Jeste li sigurni da želite obrisati ovu analizu?')) return;
    
    try {
      await deleteAnalysis(parseInt(id));
      navigate('/analysis');
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError('Greška pri brisanju analize');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Analiza nije pronađena</Alert>
      </Box>
    );
  }

  // Priprema podataka za ABC i XYZ distribuciju
  const abcData = [
    { name: 'A', value: analysis.a_items },
    { name: 'B', value: analysis.b_items },
    { name: 'C', value: analysis.c_items }
  ];

  const xyzData = [
    { name: 'X', value: analysis.x_items },
    { name: 'Y', value: analysis.y_items },
    { name: 'Z', value: analysis.z_items }
  ];

  // Priprema podataka za ABC-XYZ matricu
  const matrixData = [
    { name: 'AX', value: details.filter(d => d.abc_class === 'A' && d.xyz_class === 'X').length },
    { name: 'AY', value: details.filter(d => d.abc_class === 'A' && d.xyz_class === 'Y').length },
    { name: 'AZ', value: details.filter(d => d.abc_class === 'A' && d.xyz_class === 'Z').length },
    { name: 'BX', value: details.filter(d => d.abc_class === 'B' && d.xyz_class === 'X').length },
    { name: 'BY', value: details.filter(d => d.abc_class === 'B' && d.xyz_class === 'Y').length },
    { name: 'BZ', value: details.filter(d => d.abc_class === 'B' && d.xyz_class === 'Z').length },
    { name: 'CX', value: details.filter(d => d.abc_class === 'C' && d.xyz_class === 'X').length },
    { name: 'CY', value: details.filter(d => d.abc_class === 'C' && d.xyz_class === 'Y').length },
    { name: 'CZ', value: details.filter(d => d.abc_class === 'C' && d.xyz_class === 'Z').length }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{analysis.analysis_name}</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/analysis')}
          >
            Natrag na listu
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleDeleteAnalysis}
          >
            Obriši analizu
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis tabs">
            <Tab label="Pregled" />
            <Tab label="Detalji" />
            <Tab label="Grafovi" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Informacije o analizi</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Datum analize:</Typography>
                <Typography variant="body1">
                  {new Date(analysis.analysis_date).toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Vremenski period:</Typography>
                <Typography variant="body1">
                  {analysis.start_date ? new Date(analysis.start_date).toLocaleDateString() : 'Svi podaci'} 
                  {analysis.end_date ? ` - ${new Date(analysis.end_date).toLocaleDateString()}` : ''}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Ukupno artikala:</Typography>
                <Typography variant="body1">{analysis.total_items}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Kreirao:</Typography>
                <Typography variant="body1">{analysis.created_by || 'Nepoznato'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Distribucija artikala</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">ABC distribucija:</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={`A: ${analysis.a_items} (${((analysis.a_items / analysis.total_items) * 100).toFixed(1)}%)`} 
                    sx={{ bgcolor: ABC_COLORS.A, color: 'white' }}
                  />
                  <Chip 
                    label={`B: ${analysis.b_items} (${((analysis.b_items / analysis.total_items) * 100).toFixed(1)}%)`} 
                    sx={{ bgcolor: ABC_COLORS.B, color: 'black' }}
                  />
                  <Chip 
                    label={`C: ${analysis.c_items} (${((analysis.c_items / analysis.total_items) * 100).toFixed(1)}%)`} 
                    sx={{ bgcolor: ABC_COLORS.C, color: 'white' }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">XYZ distribucija:</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={`X: ${analysis.x_items} (${((analysis.x_items / analysis.total_items) * 100).toFixed(1)}%)`} 
                    sx={{ bgcolor: XYZ_COLORS.X, color: 'white' }}
                  />
                  <Chip 
                    label={`Y: ${analysis.y_items} (${((analysis.y_items / analysis.total_items) * 100).toFixed(1)}%)`} 
                    sx={{ bgcolor: XYZ_COLORS.Y, color: 'black' }}
                  />
                  <Chip 
                    label={`Z: ${analysis.z_items} (${((analysis.z_items / analysis.total_items) * 100).toFixed(1)}%)`} 
                    sx={{ bgcolor: XYZ_COLORS.Z, color: 'white' }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>ABC Distribucija</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={abcData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} artikala`, 'Broj artikala']} />
                  <Bar dataKey="value" name="Broj artikala">
                    {abcData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ABC_COLORS[entry.name as keyof typeof ABC_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>XYZ Distribucija</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={xyzData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} artikala`, 'Broj artikala']} />
                  <Bar dataKey="value" name="Broj artikala">
                    {xyzData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={XYZ_COLORS[entry.name as keyof typeof XYZ_COLORS]} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </Grid>
                                </Grid>
                              </TabPanel>
                              
                              <TabPanel value={tabValue} index={1}>
                                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                                  <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>ABC Klasa</InputLabel>
                                    <Select
                                      value={abcFilter}
                                      label="ABC Klasa"
                                      onChange={(e) => {
                                        setAbcFilter(e.target.value as string);
                                        setPage(0);
                                      }}
                                    >
                                      <MenuItem value="all">Sve</MenuItem>
                                      <MenuItem value="A">A</MenuItem>
                                      <MenuItem value="B">B</MenuItem>
                                      <MenuItem value="C">C</MenuItem>
                                    </Select>
                                  </FormControl>
                                  
                                  <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>XYZ Klasa</InputLabel>
                                    <Select
                                      value={xyzFilter}
                                      label="XYZ Klasa"
                                      onChange={(e) => {
                                        setXyzFilter(e.target.value as string);
                                        setPage(0);
                                      }}
                                    >
                                      <MenuItem value="all">Sve</MenuItem>
                                      <MenuItem value="X">X</MenuItem>
                                      <MenuItem value="Y">Y</MenuItem>
                                      <MenuItem value="Z">Z</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                                
                                {detailsLoading ? (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                  </Box>
                                ) : (
                                  <>
                                    <TableContainer>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Šifra artikla</TableCell>
                                            <TableCell>Naziv artikla</TableCell>
                                            <TableCell>ABC</TableCell>
                                            <TableCell>XYZ</TableCell>
                                            <TableCell>Zona skladišta</TableCell>
                                            <TableCell align="right">Ukupni promet</TableCell>
                                            <TableCell align="right">Ukupna količina</TableCell>
                                            <TableCell align="right">Postotak prometa</TableCell>
                                            <TableCell align="right">Koef. varijacije</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {details.map((detail) => (
                                            <TableRow key={detail.detail_id}>
                                              <TableCell>{detail.item_code}</TableCell>
                                              <TableCell>{detail.item_name}</TableCell>
                                              <TableCell>
                                                <Chip 
                                                  label={detail.abc_class} 
                                                  size="small"
                                                  sx={{ 
                                                    bgcolor: ABC_COLORS[detail.abc_class as keyof typeof ABC_COLORS],
                                                    color: detail.abc_class === 'B' ? 'black' : 'white'
                                                  }}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <Chip 
                                                  label={detail.xyz_class} 
                                                  size="small"
                                                  sx={{ 
                                                    bgcolor: XYZ_COLORS[detail.xyz_class as keyof typeof XYZ_COLORS],
                                                    color: detail.xyz_class === 'Y' ? 'black' : 'white'
                                                  }}
                                                />
                                              </TableCell>
                                              <TableCell>{detail.warehouse_zone || 'N/A'}</TableCell>
                                              <TableCell align="right">{detail.total_turnover}</TableCell>
                                              <TableCell align="right">{detail.total_quantity}</TableCell>
                                              <TableCell align="right">{detail.percentage_of_turnover.toFixed(2)}%</TableCell>
                                              <TableCell align="right">{detail.coefficient_variation.toFixed(2)}%</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                    
                                    <TablePagination
                                      rowsPerPageOptions={[10, 25, 50, 100]}
                                      component="div"
                                      count={analysis.total_items}
                                      rowsPerPage={rowsPerPage}
                                      page={page}
                                      onPageChange={handleChangePage}
                                      onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                  </>
                                )}
                              </TabPanel>
                              
                              <TabPanel value={tabValue} index={2}>
                                <Grid container spacing={3}>
                                  <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>ABC-XYZ Matrica</Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                      <BarChart
                                        data={matrixData}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" />
                                        <Tooltip formatter={(value) => [`${value} artikala`, 'Broj artikala']} />
                                        <Legend />
                                        <Bar dataKey="value" name="Broj artikala" fill="#8884d8" />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </Grid>
                                  
                                  <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>Pareto Analiza</Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                      <LineChart
                                        data={details.slice(0, 50)} // Prikazujemo samo prvih 50 artikala
                                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                          dataKey="rank" 
                                          label={{ value: 'Rang artikla', position: 'insideBottom', offset: -10 }}
                                        />
                                        <YAxis 
                                          yAxisId="left" 
                                          orientation="left" 
                                          stroke="#8884d8"
                                          label={{ value: 'Ukupni promet', angle: -90, position: 'insideLeft' }}
                                        />
                                        <YAxis 
                                          yAxisId="right" 
                                          orientation="right" 
                                          stroke="#82ca9d"
                                          domain={[0, 100]}
                                          label={{ value: 'Kumulativni postotak (%)', angle: -90, position: 'insideRight' }}
                                        />
                                        <Tooltip 
                                          formatter={(value, name) => {
                                            if (name === 'total_turnover') return [value, 'Ukupni promet'];
                                            if (name === 'cumulative_percentage') return [`${typeof value === 'number' ? value.toFixed(2) : value}%`, 'Kumulativni postotak'];
                                            return [value, name];
                                          }}
                                          labelFormatter={(label) => `Rang: ${label}`}
                                        />
                                        <Legend />
                                        <Line 
                                          yAxisId="left" 
                                          type="monotone" 
                                          dataKey="total_turnover" 
                                          name="Ukupni promet" 
                                          stroke="#8884d8" 
                                          dot={false}
                                        />
                                        <Line 
                                          yAxisId="right" 
                                          type="monotone" 
                                          dataKey="cumulative_percentage" 
                                          name="Kumulativni postotak" 
                                          stroke="#82ca9d" 
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </Grid>
                                </Grid>
                              </TabPanel>
                            </Paper>
                          </Box>
                        );
                      };
                      
                      export default AnalysisDetail;
                      
