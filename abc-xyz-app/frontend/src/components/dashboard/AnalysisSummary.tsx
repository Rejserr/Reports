import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { ShowChart as ChartIcon } from '@mui/icons-material';
import { 
  ResponsiveContainer as RResponsiveContainer,
  PieChart as RPieChart, 
  Pie as RPie, 
  Cell as RCell, 
  Tooltip as RTooltip 
} from 'recharts';

// Type assertions to bypass TypeScript errors
const ResponsiveContainer = RResponsiveContainer as any;
const PieChart = RPieChart as any;
const Pie = RPie as any;
const Cell = RCell as any;
const Tooltip = RTooltip as any;

// Interface for the data structure
interface AnalysisSummaryProps {
  latestAnalysis: {
    id: string;
    name: string;
    date: string;
    abcDistribution: {
      name: string;
      value: number;
      color: string;
    }[];
    xyzDistribution: {
      name: string;
      value: number;
      color: string;
    }[];
    totalItems?: number;
  };
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ latestAnalysis }) => {
  const navigate = useNavigate();
  
  // Create a custom label for pie charts
  const renderCustomizedLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            ABC-XYZ Analysis Summary
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<ChartIcon />}
            onClick={() => navigate('/results')}
          >
            View Full Results
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Analysis: {latestAnalysis.name} | Date: {latestAnalysis.date}
            {latestAnalysis.totalItems && ` | Total Items: ${latestAnalysis.totalItems}`}
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" align="center" gutterBottom>
              ABC Distribution
            </Typography>
            <Box sx={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={latestAnalysis.abcDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {latestAnalysis.abcDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" align="center" gutterBottom>
              XYZ Distribution
            </Typography>
            <Box sx={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={latestAnalysis.xyzDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {latestAnalysis.xyzDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AnalysisSummary;
