import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getAnalyses } from '../services/analysisService';
import Dashboard from '../components/dashboard/Dashboard';

interface DashboardData {
  summary: {
    item_count: number;
    picking_count: number;
    zone_count: number;
    analysis_count: number;
  };
  distributions: {
    abc: { A: number; B: number; C: number };
    xyz: { X: number; Y: number; Z: number };
  };
  matrix: Record<string, Record<string, { item_count: number; turnover: number; quantity: number }>>;
  paretoData: Array<{
    ItemCode: string;
    ItemName: string;
    TotalTurnover: number;
    PercentageOfTurnover: number;
    CumulativePercentage: number;
    ABC_Class: string;
  }>;
  topItems: Array<{
    ItemCode: string;
    ItemName: string;
    PickCount: number;
    TotalQty: number;
  }>;
  warehouseDistribution: Array<{
    WarehouseZone: string;
    PickCount: number;
  }>;
  pickingTrend: Array<{
    PickDate: string;
    PickCount: number;
  }>;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [analyses, setAnalyses] = useState<Array<{ result_id: number; analysis_name: string }>>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Dohvaćanje liste analiza
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const analysesData = await getAnalyses();
        setAnalyses(analysesData.map((a: any) => ({ 
          result_id: a.result_id, 
          analysis_name: a.analysis_name 
        })));
        
        // Automatski odaberi zadnju analizu ako postoji
        if (analysesData.length > 0) {
          setSelectedAnalysisId(analysesData[0].result_id);
        }
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError('Greška pri dohvaćanju analiza');
      }
    };
    
    fetchAnalyses();
  }, []);

  // Dohvaćanje podataka za dashboard
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAnalysisId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Dohvaćanje sažetka
        const summaryResponse = await api.get('/dashboard/summary');
        
        // Dohvaćanje ABC-XYZ distribucije
        const distributionResponse = await api.get(`/dashboard/abc-xyz-distribution?result_id=${selectedAnalysisId}`);
        
        // Dohvaćanje Pareto podataka
        const paretoResponse = await api.get(`/dashboard/pareto-chart?result_id=${selectedAnalysisId}`);
        
        // Dohvaćanje top artikala
        const topItemsResponse = await api.get('/dashboard/top-items');
        
        // Dohvaćanje distribucije po skladištu
        const warehouseResponse = await api.get('/dashboard/warehouse-distribution');
        
        // Dohvaćanje trenda picking operacija
        const trendResponse = await api.get('/dashboard/picking-trend');
        
        // Kombiniranje podataka
        setData({
          summary: summaryResponse.data,
          distributions: {
            abc: {
              A: distributionResponse.data.A ? distributionResponse.data.A.item_count : 0,
              B: distributionResponse.data.B ? distributionResponse.data.B.item_count : 0,
              C: distributionResponse.data.C ? distributionResponse.data.C.item_count : 0
            },
            xyz: {
              X: distributionResponse.data.X ? distributionResponse.data.X.item_count : 0,
              Y: distributionResponse.data.Y ? distributionResponse.data.Y.item_count : 0,
              Z: distributionResponse.data.Z ? distributionResponse.data.Z.item_count : 0
            }
          },
          matrix: distributionResponse.data,
          paretoData: paretoResponse.data,
          topItems: topItemsResponse.data,
          warehouseDistribution: warehouseResponse.data,
          pickingTrend: trendResponse.data
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Greška pri dohvaćanju podataka za dashboard');
        setLoading(false);
      }
    };
    
    if (selectedAnalysisId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [selectedAnalysisId]);

  const handleAnalysisChange = (event: SelectChangeEvent<number>) => {
    setSelectedAnalysisId(event.target.value as number);
  };

  const handleNewAnalysis = () => {
    navigate('/analysis/new');
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

  if (!selectedAnalysisId) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Nema dostupnih analiza
          </Typography>
          <Typography variant="body1" paragraph>
            Potrebno je pokrenuti ABC-XYZ analizu kako bi se prikazali podaci na dashboardu.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNewAnalysis}
          >
            Pokreni novu analizu
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Dashboard</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Analiza</InputLabel>
            <Select
              value={selectedAnalysisId}
              onChange={handleAnalysisChange}
              label="Analiza"
            >
              {analyses.map((analysis) => (
                <MenuItem key={analysis.result_id} value={analysis.result_id}>
                  {analysis.analysis_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNewAnalysis}
          >
            Nova analiza
          </Button>
        </Box>
      </Box>
      
      {data && (
        <Dashboard 
          summary={data.summary}
          distributions={data.distributions}
          matrix={data.matrix}
          paretoData={data.paretoData}
          topItems={data.topItems}
          warehouseDistribution={data.warehouseDistribution}
          pickingTrend={data.pickingTrend}
        />
      )}
    </Box>
  );
};

export default DashboardPage;

