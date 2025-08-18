import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard.jsx';

/**
 * GenreSections component fetches and displays all available genres as clickable tags.
 * Each tag links to a route where users can view movies in that specific genre.
 *
 * @component
 * @returns {JSX.Element} A list of genres displayed as buttons.
 */
const GenreSections = () => {
  /** @type {[Array, Function]} genres - State holding genre objects fetched from the API */
  const [genres, setGenres] = useState([]);

  /**
   * useEffect hook to fetch genre data from the backend API on component mount.
   */
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/genres')
      .then(response => {
        setGenres(response.data); // ✅ Save genres to state
      })
      .catch(error => {
        console.error('Error fetching genres:', error); // ❌ Error handling
      });
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        {genres.map((genre) => (
          <a key={genre.id}
             href={`/genres/${genre.id}`}
             style={{
               padding: '1rem',
               background: '#eee',
               borderRadius: '10px',
               textDecoration: 'none',
               color: 'black',
               fontWeight: 'bold'
             }}
          >
            {genre.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default GenreSections;
