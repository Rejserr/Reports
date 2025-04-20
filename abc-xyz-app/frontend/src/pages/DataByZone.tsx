import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material/Select';

// Ovo bi trebalo zamijeniti stvarnim API pozivom
const mockZones = ['Stupnik', 'Zagreb', 'Split', 'Rijeka', 'Osijek'];
const mockData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  itemCode: `ITEM${(i + 1).toString().padStart(3, '0')}`,
  itemName: `Artikl ${i + 1}`,
  zone: mockZones[i % mockZones.length],
  abcClass: ['A', 'B', 'C'][i % 3],
  xyzClass: ['X', 'Y', 'Z'][i % 3],
  turnover: Math.floor(Math.random() * 1000) + 100,
  quantity: Math.floor(Math.random() * 100) + 10
}));

const DataByZone: React.FC = () => {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const fetchData = () => {
    setLoading(true);
    setError(null);
    
    // Simulacija API poziva
    setTimeout(() => {
      try {
        const filteredData = selectedZone 
          ? mockData.filter(item => item.zone === selectedZone)
          : mockData;
        setData(filteredData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Došlo je do greške prilikom dohvaćanja podataka');
        setLoading(false);
      }
    }, 1000);
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
  
  

  const handleZoneChange = (event: SelectChangeEvent<string>) => {
    setSelectedZone(event.target.value);
};
  
  const handleSearch = () => {
    fetchData();
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pregled podataka po zonama skladišta
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel id="zone-select-label">Zona skladišta</InputLabel>
              <Select
                labelId="zone-select-label"
                id="zone-select"
                value={selectedZone}
                label="Zona skladišta"
                onChange={handleZoneChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Sve zone</em>
                </MenuItem>
                {mockZones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
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
            Artikli po zonama
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : data.length === 0 ? (
            <Alert severity="info">
              Nema podataka za odabranu zonu
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Šifra artikla</TableCell>
                      <TableCell>Naziv artikla</TableCell>
                      <TableCell>Zona</TableCell>
                      <TableCell>ABC klasa</TableCell>
                      <TableCell>XYZ klasa</TableCell>
                      <TableCell>Promet</TableCell>
                      <TableCell>Količina</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.zone}</TableCell>
                          <TableCell>{item.abcClass}</TableCell>
                          <TableCell>{item.xyzClass}</TableCell>
                          <TableCell>{item.turnover}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
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

export default DataByZone;
