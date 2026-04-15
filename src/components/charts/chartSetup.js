import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,      // ✅ REQUIRED for Doughnut / Pie
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement       // ✅ for Bar charts
);