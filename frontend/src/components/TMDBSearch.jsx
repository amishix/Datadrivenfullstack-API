import { useState, useEffect } from 'react';
import axios from 'axios';

const TMDBSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const API_KEY = '10a99b3c00d4e3d999c458f1b76b87b2';

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) setSearchHistory(JSON.parse(stored));
  }, []);

  // Clear results when input is manually cleared
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    const query = searchTerm.trim();
    if (!query) return;

    try {
      const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: { api_key: API_KEY, query }
      });

      setResults(response.data.results || []);

      // Save to history if it's not already there
      if (!searchHistory.includes(query)) {
        const updatedHistory = [query, ...searchHistory].slice(0, 8);
        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search movies..."
          style={{
            width: '60%',
            padding: '1rem',
            fontSize: '1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#222',
            color: '#eee',
            boxShadow: '0 0 10px rgba(255,255,255,0.1)'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: '#FFD700',
            border: 'none',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#111'
          }}
        >
          Search
        </button>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div style={{ marginTop: '1rem', color: '#FFD700' }}>
          <h3>Recent Searches</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => setSearchTerm(term)}
                style={{
                  background: '#333',
                  color: '#FFD700',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {term}
              </button>
            ))}
            <button
              onClick={clearHistory}
              style={{
                background: '#FFD700',
                color: '#111',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      {/* Grid Results */}
      {results.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          padding: '2rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {results.map((movie) => (
            <a
              key={movie.id}
              href={`/tmdb/${movie.id}`}
              style={{ textDecoration: 'none', color: '#eee', textAlign: 'center' }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                style={{
                  width: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                  objectFit: 'cover',
                  height: '280px'
                }}
              />
              <h3 style={{ marginTop: '0.5rem', fontSize: '1rem' }}>{movie.title}</h3>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default TMDBSearch;

