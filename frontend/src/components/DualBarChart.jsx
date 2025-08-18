// Import react and the bar chart tool from Chart.js 
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  // Import  components for the dual bar chart
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// dualbarchart displays a bar chart comparing wins vs nominations
function DualBarChart({
  labels,
  wins,
  nominations,
  chartTitle = 'Wins vs Nominations by Year',
  xLabel = 'Year',
  yLabel = 'Count'
}) {
  // keep raw references for ratio calculations
  const winsRaw = wins;
  const nominationsRaw = nominations;
  // labels and bars for wins & nominations
  const data = {
    labels,
    datasets: [
      {
        label: 'Wins',
        data: wins,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Nominations',
        data: nominations,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
    ],
  };
   //  chart appearance
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: chartTitle,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        //  tooltip showing win rate as a percentage
        callbacks: {
          afterBody: function (tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const wins = winsRaw[index];
            const noms = nominationsRaw[index];
            const ratio = noms ? ((wins / noms) * 100).toFixed(1) : 'N/A';
            return `Win Rate: ${ratio}%`;
          }
        }
      },
      legend: {
        position: 'top',
      },
    },
    // Add labels to axis
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yLabel,
        },
      },
      x: {
        title: {
          display: true,
          text: xLabel,
        },
      },
    },
  };
  // load bar chart inside container
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default DualBarChart;
