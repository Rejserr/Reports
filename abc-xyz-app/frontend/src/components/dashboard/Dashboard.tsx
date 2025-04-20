import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import StatCard from './StatCard';
import ABCChart from './ABCChart';
import XYZChart from './XYZChart';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
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

const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  distributions, 
  matrix, 
  paretoData, 
  topItems, 
  warehouseDistribution, 
  pickingTrend 
}) => {
  // Priprema podataka za ABC-XYZ matricu
  const matrixData = [];
  for (const abc of ['A', 'B', 'C']) {
    for (const xyz of ['X', 'Y', 'Z']) {
      if (matrix[abc] && matrix[abc][xyz]) {
        matrixData.push({
          name: `${abc}${xyz}`,
          value: matrix[abc][xyz].item_count,
          turnover: matrix[abc][xyz].turnover,
          quantity: matrix[abc][xyz].quantity,
          abc,
          xyz
        });
      } else {
        matrixData.push({
          name: `${abc}${xyz}`,
          value: 0,
          turnover: 0,
          quantity: 0,
          abc,
          xyz
        });
      }
    }
  }

  // Priprema podataka za ABC i XYZ distribuciju
  const abcData = [
    { name: 'A', value: distributions.abc.A },
    { name: 'B', value: distributions.abc.B },
    { name: 'C', value: distributions.abc.C }
  ];

  const xyzData = [
    { name: 'X', value: distributions.xyz.X },
    { name: 'Y', value: distributions.xyz.Y },
    { name: 'Z', value: distributions.xyz.Z }
  ];

  return (
    <Grid container spacing={3}>
      {/* Statistički kartice */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Ukupno artikala" 
          value={summary.item_count.toString()} 
          icon="inventory" 
          color="#2196F3"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Picking operacije (30 dana)" 
          value={summary.picking_count.toString()} 
          icon="assignment" 
          color="#4CAF50"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Zone skladišta" 
          value={summary.zone_count.toString()} 
          icon="grid_view" 
          color="#FFC107"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Provedene analize" 
          value={summary.analysis_count.toString()} 
          icon="analytics" 
          color="#9C27B0"
        />
      </Grid>

      {/* ABC i XYZ distribucija */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>ABC Distribucija</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={abcData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {abcData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ABC_COLORS[entry.name as keyof typeof ABC_COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} artikala`, 'Količina']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>XYZ Distribucija</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={xyzData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : 0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {xyzData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={XYZ_COLORS[entry.name as keyof typeof XYZ_COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} artikala`, 'Količina']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* ABC-XYZ Matrica */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>ABC-XYZ Matrica</Typography>
          <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={matrixData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'value') return [`${value} artikala`, 'Broj artikala'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Broj artikala" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Pareto graf */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Pareto Analiza</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paretoData.slice(0, 20)} // Prikazujemo samo prvih 20 artikala
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="ItemCode" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  interval={0}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'TotalTurnover') return [value, 'Ukupni promet'];
                    if (name === 'cumulative_percentage') return [`${typeof value === 'number' ? value.toFixed(2) : value}%`, 'Kumulativni postotak'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="TotalTurnover" 
                  name="Ukupni promet" 
                  fill="#8884d8" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="CumulativePercentage" 
                  name="Kumulativni postotak" 
                  stroke="#82ca9d" 
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Top artikli */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Top 10 Artikala</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topItems.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="ItemCode" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'PickCount') return [value, 'Broj picking operacija'];
                    if (name === 'TotalQty') return [value, 'Ukupna količina'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const item = topItems.find(i => i.ItemCode === label);
                    return item ? `${item.ItemCode} - ${item.ItemName}` : label;
                  }}
                />
                <Legend />
                <Bar dataKey="PickCount" name="Broj picking operacija" fill="#8884d8" />
                <Bar dataKey="TotalQty" name="Ukupna količina" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Distribucija po skladištu */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Distribucija po zonama skladišta</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warehouseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : 0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="PickCount"
                  nameKey="WarehouseZone"
                >
                  {warehouseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} operacija`, 'Broj picking operacija']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Trend picking operacija */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Trend picking operacija (30 dana)</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={pickingTrend}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="PickDate" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} operacija`, 'Broj picking operacija']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="PickCount" 
                  name="Broj picking operacija" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;

