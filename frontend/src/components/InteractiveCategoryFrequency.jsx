import React, { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// register pie chart components
ChartJS.register(ArcElement, Tooltip, Legend, Title);
// interactive pie chart for category frequency with drill-down
export default function InteractiveCategoryFrequency() {
  // ref to access chart instance
  const chartRef = useRef();
  // all categories data
  const [categories, setCategories] = useState([]);
  // number of top categories to show
  const [topN, setTopN] = useState(10);
  // selected category for drill-down
  const [selectedCategory, setSelectedCategory] = useState(null);
  // detailed drill data for selected category
  const [drillData, setDrillData] = useState([]);

  // fetch category frequency on mount
  useEffect(() => {
    fetch('http://localhost:5050/api/categories_frequency')
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);
  // sort and slice top categories
  const topCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
  // prepare labels and values arrays
  const labels = topCategories.map(c => c.category);
  const values = topCategories.map(c => c.count);
  // pie chart data object
  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: labels.map((_, i) => `hsl(${(i/labels.length)*360},70%,50%)`)
    }]
  };
  // chart options with click handler to drill
  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Award Categories by Frequency', color: 'white' },
      legend: { labels: { color: 'white' } }
    },
    maintainAspectRatio: false,
    onClick: (e) => {
      const chart = chartRef.current;
      if (!chart) return;
      // find clicked slice index
      const pts = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
      if (!pts.length) return;
      const idx = pts[0].index;
      const category = labels[idx];
      setSelectedCategory(category);
      // fetch drill-down data for selected category
      fetch(`http://localhost:5050/api/oscars_by_category?category=${encodeURIComponent(category)}&limit=${topN}`)
        .then(r => r.json())
        .then(setDrillData)
        .catch(console.error);
    }
  };
  // choices for topN control
  const choices = [5, 10, 15, 20];

  return (
    <div style={{ color: 'white' }}>
      {/* topN segmented control */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
        <span>Top</span>
        {choices.map(n => (
          <button
            key={n}
            onClick={() => setTopN(n)}
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              border: n === topN ? '2px solid #FFD700' : '1px solid #666',
              background: n === topN ? '#FFD700' : '#222',
              color: n === topN ? '#111' : '#fff',
              cursor: 'pointer'
            }}
          >
            {n}
          </button>
        ))}
        <span>Categories</span>
      </div>

      {/* pie chart */}
      <div style={{ maxWidth: '800px', margin: 'auto', height: '800px' }}>
        <Pie ref={chartRef} data={data} options={options} />
      </div>
      {/* drill-down list for selected category */}
      {selectedCategory && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Recent Winners in “{selectedCategory}”</h3>
          <ul>
            {drillData.map(a => (
              <li key={`${a.film}-${a.year}`}>
                {a.year} — <strong>{a.film}</strong> ({a.recipient})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
