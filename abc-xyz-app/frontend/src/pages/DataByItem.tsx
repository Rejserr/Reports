import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField,
  Autocomplete,
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
  Alert,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Ovo bi trebalo zamijeniti stvarnim API pozivom
const mockItems = Array.from({ length: 100 }, (_, i) => ({
  code: `ITEM${(i + 1).toString().padStart(3, '0')}`,
  name: `Artikl ${i + 1}`
}));

const mockMonthlyData = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - i);
  return {
    month: date.toISOString().slice(0, 7), // YYYY-MM format
    turnover: Math.floor(Math.random() * 100) + 10,
    quantity: Math.floor(Math.random() * 50) + 5
  };
});

const DataByItem: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemData, setItemData] = useState<any | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  const fetchData = () => {
    if (selectedItems.length === 0) {
      setError('Molimo odaberite barem jedan artikl');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulacija API poziva
    setTimeout(() => {
      try {
        // Simulacija podataka za odabrani artikl
        if (selectedItems.length === 1) {
          const item = selectedItems[0];
          setItemData({
            code: item.code,
            name: item.name,
            abcClass: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            xyzClass: ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)],
            totalTurnover: Math.floor(Math.random() * 1000) + 100,
            totalQuantity: Math.floor(Math.random() * 500) + 50,
            warehouseZone: ['Stupnik', 'Zagreb', 'Split', 'Rijeka', 'Osijek'][Math.floor(Math.random() * 5)]
          });
          
          setMonthlyData(mockMonthlyData);
        } else {
          setItemData(null);
          setMonthlyData([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Došlo je do greške prilikom dohvaćanja podataka');
        setLoading(false);
      }
    }, 1000);
  };
  
  useEffect(() => {
    if (selectedItems.length === 1) {
      fetchData();
    } else {
      setItemData(null);
      setMonthlyData([]);
    }
  }, [selectedItems]);
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pregled podataka po artiklima
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              multiple
              options={mockItems}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={selectedItems}
              onChange={(_, newValue) => setSelectedItems(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Odaberite artikle"
                  placeholder="Unesite šifru ili naziv artikla"
                  disabled={loading}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.code} - ${option.name}`}
                    {...getTagProps({ index })}
                    disabled={loading}
                  />
                ))
              }
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchData}
              disabled={loading || selectedItems.length === 0}
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
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : itemData ? (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalji artikla
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Šifra:</strong> {itemData.code}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Naziv:</strong> {itemData.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Zona skladišta:</strong> {itemData.warehouseZone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>ABC klasa:</strong> {itemData.abcClass}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>XYZ klasa:</strong> {itemData.xyzClass}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Ukupni promet:</strong> {itemData.totalTurnover}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Ukupna količina:</strong> {itemData.totalQuantity}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mjesečni podaci
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mjesec</TableCell>
                      <TableCell>Promet</TableCell>
                      <TableCell>Količina</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyData.map((month, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(month.month).toLocaleDateString('hr-HR', { year: 'numeric', month: 'long' })}</TableCell>
                        <TableCell>{month.turnover}</TableCell>
                        <TableCell>{month.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      ) : selectedItems.length > 0 ? (
        <Alert severity="info">
          Odaberite samo jedan artikl za detaljni pregled
        </Alert>
      ) : null}
    </Box>
  );
};

export default DataByItem;