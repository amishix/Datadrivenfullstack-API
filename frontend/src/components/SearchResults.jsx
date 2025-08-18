import { useState, useEffect } from 'react';

/**
 * SearchResults component displays movie search results stored in localStorage.
 * It reads results saved from a previous search and renders them in a styled grid layout.
 *
 * @component
 * @returns {JSX.Element|null} A grid of search results or null if no results are found.
 */
const SearchResults = () => {
  /** @type {[Array, Function]} results - Holds the list of search result movies */
  const [results, setResults] = useState([]);

  /**
   * useEffect retrieves search results from localStorage on component mount.
   */
  useEffect(() => {
    const storedResults = localStorage.getItem('searchResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults)); // ✅ Parse and store results in state
    }
  }, []);

  // ❌ If no results found, render nothing
  if (results.length === 0) {
    return null;
  }

  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '2rem',
      gap: '2rem',
    }}>
      {/* Section Title */}
      <h2 style={{ color: '#FFD700', fontSize: '2rem' }}>Search Results</h2>

      {/* Result Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '2rem',
        maxWidth: '1400px',
        padding: '1rem'
      }}>
        {results.map((movie) => (
          <a
            key={movie.id}
            href={`/tmdb/${movie.id}`}
            style={{
              textAlign: 'center',
              color: '#eee',
              textDecoration: 'none',
              width: '200px',
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Movie Poster */}
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
              style={{
                width: '100%',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />

            {/* Movie Title */}
            <h3 style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
              {movie.title}
            </h3>

            {/* Release Date */}
            <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
              {movie.release_date || 'Unknown Date'}
            </p>

            {/* Rating */}
            <p style={{ fontSize: '0.95rem', color: '#FFD700' }}>
              ⭐ {movie.vote_average ? `${movie.vote_average} / 10` : 'N/A'}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default SearchResults;