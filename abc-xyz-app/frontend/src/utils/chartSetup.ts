import Chart from 'chart.js/auto';
import { CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components that Chart.js needs
Chart.register(
  CategoryScale,  // Fixes "category" is not a registered scale
  LinearScale,
  BarElement,
  ArcElement,     // Fixes "arc" is not a registered element
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default Chart;
