import React, { useState } from 'react';
import OscarsBarChart from './OscarsBarChart';
// interactive chart for top winners with search & limit
export default function InteractiveTopWinners({ data }) {
  // search term for winner name
  const [query, setQuery] = useState('');
  // number of top results to show
  const [limit, setLimit] = useState(10);
  // filter data by query and limit results
  const filtered = data
    .filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, limit);
  // prepare labels & values for chart
  const labels = filtered.map(d => d.name);
  const values = filtered.map(d => d.wins);

  return (
    <div className="top-winners-controls">
     {/* controls: search & limit dropdown */}
      <div className="search-controls">
        <input
          type="text"
          className="search-input"
          value={query}
          placeholder="Search winner name…"
          onChange={e => setQuery(e.target.value)}
        />

        <select
          className="limit-select"
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
        >
          {[5, 10, 15, 20, 100].map(n => (
            <option key={n} value={n}>
              Top {n}
            </option>
          ))}
        </select>
      </div>
      {/* render bar chart with filtered data */}
      <OscarsBarChart
        labels={labels}
        values={values}
        xLabel="Actor / Studio"
        yLabel="Oscar Wins"
        chartTitle="Top Oscar Winners"
      />
    </div>
  );
}
