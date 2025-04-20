import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Divider, 
  CircularProgress, 
  Alert,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { getAnalyses, deleteAnalysis } from '../services/analysisService';

interface Analysis {
  result_id: number;
  analysis_name: string;
  analysis_date: string;
  total_items: number;
  abc_distribution: {
    A: number;
    B: number;
    C: number;
  };
  xyz_distribution: {
    X: number;
    Y: number;
    Z: number;
  };
}

const AnalysisList: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getAnalyses();
        setAnalyses(data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError('Greška pri dohvaćanju analiza');
        setLoading(false);
      }
    };
    
    fetchAnalyses();
  }, []);

  const handleViewAnalysis = (id: number) => {
    navigate(`/analysis/${id}`);
  };

  const handleDeleteAnalysis = async (id: number) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovu analizu?')) return;
    
    try {
      await deleteAnalysis(id);
      
      // Ažuriranje liste nakon brisanja
      setAnalyses(analyses.filter(analysis => analysis.result_id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError('Greška pri brisanju analize');
    }
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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">ABC-XYZ Analize</Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleNewAnalysis}
        >
          Nova analiza
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper>
        {analyses.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              Nema dostupnih analiza. Kliknite na "Nova analiza" za kreiranje nove.
            </Typography>
          </Box>
        ) : (
          <List>
            {analyses.map((analysis, index) => (
              <React.Fragment key={analysis.result_id}>
                {index > 0 && <Divider />}
                <ListItem button onClick={() => handleViewAnalysis(analysis.result_id)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {analysis.analysis_name}
                        <Chip 
                          label={`${analysis.total_items} artikala`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" component="span">
                          Datum: {new Date(analysis.analysis_date).toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={`A: ${analysis.abc_distribution.A}`} 
                            size="small" 
                            color="success" 
                          />
                          <Chip 
                            label={`B: ${analysis.abc_distribution.B}`} 
                            size="small" 
                            color="warning" 
                          />
                          <Chip 
                            label={`C: ${analysis.abc_distribution.C}`} 
                            size="small" 
                            color="error" 
                          />
                          <Chip 
                            label={`X: ${analysis.xyz_distribution.X}`} 
                            size="small" 
                            color="info" 
                          />
                          <Chip 
                            label={`Y: ${analysis.xyz_distribution.Y}`} 
                            size="small" 
                            sx={{ bgcolor: '#FF9800', color: 'white' }} 
                          />
                          <Chip 
                            label={`Z: ${analysis.xyz_distribution.Z}`} 
                            size="small" 
                            sx={{ bgcolor: '#9C27B0', color: 'white' }} 
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="view" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAnalysis(analysis.result_id);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnalysis(analysis.result_id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default AnalysisList;
