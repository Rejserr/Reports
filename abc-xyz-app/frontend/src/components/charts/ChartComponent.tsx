import React, { useRef, useEffect } from 'react';
import Chart from '../../utils/chartSetup'; // Import our configured Chart

interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  options?: any;
  height?: number;
  width?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ 
  type, 
  data, 
  options = {}, 
  height = 400,
  width = 600 
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Function to create or update chart
    const renderChart = () => {
      if (!chartRef.current) return;
      
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type,
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...options
          }
        });
      }
    };

    renderChart();
    
    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [type, data, options]); // Re-render chart when these props change

  return (
    <div style={{ height, width, position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;
