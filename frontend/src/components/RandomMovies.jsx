import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard.jsx'; // ✅ Component to render individual movie cards

/**
 * RandomMovies component fetches a list of all movies and randomly selects 8 to display.
 *
 * @component
 * @returns {JSX.Element} A grid of 8 randomly selected MovieCard components.
 */
const RandomMovies = () => {
  /** @type {[Array, Function]} movies - State holding a list of randomly selected movies */
  const [movies, setMovies] = useState([]);

  /**
   * useEffect hook that runs on component mount.
   * Fetches all movies and selects 8 at random to display.
   */
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/movies')
      .then(response => {
        const allMovies = response.data;

        // Randomly shuffle the movie array
        const shuffled = allMovies.sort(() => 0.5 - Math.random());

        // Take first 8 movies from the shuffled list
        setMovies(shuffled.slice(0, 8));
      })
      .catch(error => {
        console.error('Error fetching random movies:', error);
      });
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1.5rem',
      padding: '1rem'
    }}>
      {/* Render each movie as a MovieCard */}
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default RandomMovies;
