// import react and pie component
import React from 'react';
// import pie chart helper from react-chartjs-2
import { Pie } from 'react-chartjs-2';
// import core chartjs parts
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
// register chartjs elements for pie chart
ChartJS.register(ArcElement, Tooltip, Legend, Title);
// piechart component showing frequency slices for labels/values
function PieChart({ labels = [], values = [], chartTitle = 'Category Frequency' }) {
    // debug incoming props
  console.log("PieChart labels:", labels);
  console.log("PieChart values:", values);
  // validate props are arrays
  if (!Array.isArray(labels) || !Array.isArray(values)) {
    console.error("Invalid props passed to PieChart:", { labels, values });
    return <p style={{ color: 'white' }}>Invalid chart data</p>;
  }
  // limit items to first 10
  const cleanedLabels = labels.slice(0, 10);
  const cleanedValues = values.slice(0, cleanedLabels.length);
  // ensure matching lengths
  if (cleanedLabels.length !== cleanedValues.length) {
    console.error("Mismatched label/value lengths:", { cleanedLabels, cleanedValues });
    return <p style={{ color: 'white' }}>Label/value mismatch</p>;
  }
  // prepare data object for chart
  const data = {
    labels: cleanedLabels,
    datasets: [
      {
        label: 'Frequency',
        data: cleanedValues,
        backgroundColor: [
        '#aec7e8', '#ffbb78', '#98df8a', '#ff9896',
        '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7',
        '#dbdb8d', '#9edae5',],
        borderWidth: 1,
      },
    ],
  };
  // chart display options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
  };
  // render pie chart inside container
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Pie data={data} options={options} />
    </div>
  );
}

export default PieChart;