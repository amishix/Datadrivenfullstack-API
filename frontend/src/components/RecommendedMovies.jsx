import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * RecommendedMovies component fetches and displays a horizontal scroll row
 * of popular movies from the TMDB API.
 *
 * @component
 * @returns {JSX.Element} A horizontally scrollable row of recommended movie posters.
 */
const RecommendedMovies = () => {
  /** @type {[Array, Function]} movies - State holding popular movie data from TMDB */
  const [movies, setMovies] = useState([]);

  /** @constant {string} API_KEY - TMDB API key for authentication */
  const API_KEY = '10a99b3c00d4e3d999c458f1b76b87b2'; // 🔐 Replace with env var in production

  /**
   * useEffect hook to fetch popular movies from TMDB when the component mounts.
   */
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get('https://api.themoviedb.org/3/movie/popular', {
          params: { api_key: API_KEY }
        });
        setMovies(res.data.results); // ✅ Store movie results in state
      } catch (err) {
        console.error('❌ Error fetching popular movies:', err);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'auto',
      gap: '1rem',
      width: '100%',
    }}>
      {/* Render each popular movie poster as a link to its detail page */}
      {movies.map(movie => (
        <a key={movie.id} href={`/tmdb/${movie.id}`} style={{ flex: '0 0 auto' }}>
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
            style={{
              width: '150px',
              height: '255px',
              objectFit: 'cover',
              borderRadius: '10px',
            }}
          />
        </a>
      ))}
    </div>
  );
};

export default RecommendedMovies;
