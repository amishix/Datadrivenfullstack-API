import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// register chartjs components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
// bar chart for oscars data (by year or most awarded films)
export default function OscarsBarChart({ chartType, labels: propLabels, values: propValues, chartTitle = '', xLabel = '', yLabel = '' }) {
  // labels and values state
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  // load or set data on mount or when props change
  useEffect(() => {
    // use passed-in data if available
    if (propLabels && propValues) {
      setLabels(propLabels);
      setValues(propValues);
      return;
    }
    // default api for most awarded films
    let url = 'http://localhost:5050/api/most_awarded_films';
    // switch to oscars by year if needed
    if (chartType === 'oscars_by_year') {
      url = 'http://localhost:5050/api/oscars_by_year';
    }
    // fetch data
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (chartType === 'oscars_by_year') {
          // years sorted ascending
          const allYears = Object.keys(data).sort((a, b) => Number(a) - Number(b));
          setLabels(allYears);
          setValues(allYears.map(year => data[year].length));
        } else {
          // most awarded films
          setLabels(data.map(d => d.title));
          setValues(data.map(d => d.wins));
        }
      });
  }, [chartType, propLabels, propValues]);
  // prepare chart dataset
  const data = {
    labels,
    datasets: [{
      label: yLabel || (chartType === 'oscars_by_year' ? 'Number of Awards' : 'Oscar Wins'),
      data: values,
      backgroundColor: 'rgba(255, 206, 86, 0.7)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1,
    }],
  };
  // determine axis config for by-year vs films
  const isByYear = chartType === 'oscars_by_year';
  // chart options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: chartTitle || (isByYear ? 'Oscars Awarded per Year' : 'Most Awarded Films'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: !!yLabel,
          text: yLabel,
        },
      },
      x: {
        title: {
          display: !!xLabel,
          text: xLabel,
        },
        ticks: isByYear
          ? {
              autoSkip: true,
              maxTicksLimit: 25,
              maxRotation: 0,
              minRotation: 0,
              font: { size: 10 },
            }
          : {
              maxRotation: 90,
              minRotation: 90,
              autoSkip: true,
              maxTicksLimit: labels.length > 50 ? 25 : undefined,
              font: {
                size: labels.length > 50 ? 8 : 12,
              },
            },
      },
    },
  };
  // show loading if data not ready
  if (!labels.length) return <p>Loading chart...</p>;

  // render bar chart
  return (
    <div className="bar-container">
       <Bar data={data} options={options} />
     </div>
  );
}