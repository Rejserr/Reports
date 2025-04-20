import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import ResultsTable from '../components/analysis/ResultsTable';

// Import recharts components directly
import {
  ResponsiveContainer as RResponsiveContainer,
  PieChart as RPieChart,
  Pie as RPie,
  Cell as RCell,
  Tooltip as RTooltip,
  Legend as RLegend,
  BarChart as RBarChart,
  Bar as RBar,
  XAxis as RXAxis,
  YAxis as RYAxis,
  CartesianGrid as RCartesianGrid
} from 'recharts';

// Type assertions to bypass TypeScript errors
const ResponsiveContainer = RResponsiveContainer as any;
const PieChart = RPieChart as any;
const Pie = RPie as any;
const Cell = RCell as any;
const Tooltip = RTooltip as any;
const Legend = RLegend as any;
const BarChart = RBarChart as any;
const Bar = RBar as any;
const XAxis = RXAxis as any;
const YAxis = RYAxis as any;
const CartesianGrid = RCartesianGrid as any;

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
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
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

interface ResultsData {
  item: string;
  description: string;
  abc: string;
  xyz: string;
  turnover: number;
  quantity: number;
  coefficient: string;
}

interface DistributionData {
  name: string;
  value: number;
}

interface SummaryData {
  name: string;
  date: string;
  totalItems: number;
  abcDistribution: DistributionData[];
  xyzDistribution: DistributionData[];
  matrixDistribution: DistributionData[];
}

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState<ResultsData[] | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  
  useEffect(() => {
    // Simulate API call to fetch analysis results
    const fetchResults = async () => {
      try {
        // In a real app, you would fetch data from an API
        setTimeout(() => {
          // Mock results data
          const mockResults = Array.from({ length: 50 }, (_, i) => ({
            item: `ITEM-${1000 + i}`,
            description: `Product ${i + 1}`,
            abc: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            xyz: ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)],
            turnover: Math.floor(Math.random() * 10000),
            quantity: Math.floor(Math.random() * 500),
            coefficient: (Math.random() * 100).toFixed(2)
          }));
          
          // Mock summary data
          const mockSummary = {
            name: `Analysis ${id}`,
            date: new Date().toISOString().split('T')[0],
            totalItems: mockResults.length,
            abcDistribution: [
              { name: 'A', value: 20 },
              { name: 'B', value: 30 },
              { name: 'C', value: 50 }
            ],
            xyzDistribution: [
              { name: 'X', value: 40 },
              { name: 'Y', value: 35 },
              { name: 'Z', value: 25 }
            ],
            matrixDistribution: [
              { name: 'AX', value: 10 },
              { name: 'AY', value: 5 },
              { name: 'AZ', value: 5 },
              { name: 'BX', value: 15 },
              { name: 'BY', value: 10 },
              { name: 'BZ', value: 5 },
              { name: 'CX', value: 15 },
              { name: 'CY', value: 20 },
              { name: 'CZ', value: 15 }
            ]
          };
          
          setResults(mockResults);
          setSummary(mockSummary);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Define colors for ABC and XYZ charts
  const abcColors = ['#4caf50', '#ffeb3b', '#f44336']; // Green, Yellow, Red
  const xyzColors = ['#2196f3', '#ff9800', '#9c27b0']; // Blue, Orange, Purple
  
  // Add colors to the distribution data
  const abcDistributionWithColors = summary?.abcDistribution.map((item, index) => ({
    ...item,
    color: abcColors[index]
  })) || [];
  
  const xyzDistributionWithColors = summary?.xyzDistribution.map((item, index) => ({
    ...item,
    color: xyzColors[index]
  })) || [];
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/analyses')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {summary?.name || 'Analysis Results'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ mr: 1 }}
        >
          Export
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
        >
          Share
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Summary" />
          <Tab label="Data Table" />
          <Tab label="Charts" />
          <Tab label="Recommendations" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analysis Overview
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1">
                    Date: {summary?.date}
                  </Typography>
                  <Typography variant="body1">
                    Total Items: {summary?.totalItems}
                  </Typography>
                  <Typography variant="body1">
                  A Items: {summary?.abcDistribution[0].value}% ({Math.round((summary?.abcDistribution[0].value || 0) * (summary?.totalItems || 0) / 100)} items)
                  </Typography>
                  <Typography variant="body1">
                  X Items: {summary?.xyzDistribution[0].value}% ({Math.round((summary?.xyzDistribution[0].value || 0) * (summary?.totalItems || 0) / 100)} items)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Insights
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" paragraph>
                    High-value items (A category) make up {summary?.abcDistribution[0].value}% of total inventory value.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {summary?.xyzDistribution[0].value}% of items show stable demand patterns (X category).
                  </Typography>
                  <Typography variant="body1">
                  {Math.round((summary?.matrixDistribution[0].value || 0) * (summary?.totalItems || 0) / 100)} items are both high-value and stable (AX category).
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    ABC Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={abcDistributionWithColors}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {abcDistributionWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    XYZ Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={xyzDistributionWithColors}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {xyzDistributionWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {results && <ResultsTable data={results} />}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                ABC-XYZ Matrix
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary?.matrixDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    A Items
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" paragraph>
                    High-value items requiring close monitoring and management.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations:
                  </Typography>
                  <Typography variant="body2">
                    • Frequent inventory checks
                  </Typography>
                  <Typography variant="body2">
                    • Optimal storage locations
                  </Typography>
                  <Typography variant="body2">
                    • Regular supplier evaluations
                  </Typography>
                  <Typography variant="body2">
                    • Consider safety stock for critical items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    X Items
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" paragraph>
                    Items with stable and predictable demand patterns.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations:
                  </Typography>
                  <Typography variant="body2">
                    • Implement automated replenishment
                  </Typography>
                  <Typography variant="body2">
                    • Use statistical forecasting
                  </Typography>
                  <Typography variant="body2">
                    • Maintain consistent safety stock
                  </Typography>
                  <Typography variant="body2">
                    • Consider long-term supplier contracts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    AX Items
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" paragraph>
                    High-value items with stable demand - your most important inventory.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations:
                  </Typography>
                  <Typography variant="body2">
                    • Premium warehouse locations
                  </Typography>
                  <Typography variant="body2">
                    • Just-in-time delivery where possible
                  </Typography>
                  <Typography variant="body2">
                    • Strategic partnerships with suppliers
                  </Typography>
                  <Typography variant="body2">
                    • Regular quality control checks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Results;

