import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  ResponsiveContainer as RResponsiveContainer,
  PieChart as RPieChart,
  Pie as RPie,
  Cell as RCell,
  Tooltip as RTooltip,
  Legend as RLegend
} from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface ABCChartProps {
  data: DataItem[];
}

// Use type assertions to bypass TypeScript errors
const ResponsiveContainer = RResponsiveContainer as any;
const PieChart = RPieChart as any;
const Pie = RPie as any;
const Cell = RCell as any;
const Tooltip = RTooltip as any;
const Legend = RLegend as any;

const ABCChart: React.FC<ABCChartProps> = ({ data }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ABC Analysis
      </Typography>
      <Box sx={{ height: 300, maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ABCChart;
