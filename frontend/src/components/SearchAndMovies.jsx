import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard.jsx';  // ✅ Reusable component for displaying individual movie info

/**
 * SearchAndMovies component fetches and displays all movies from the local Flask API.
 * Movies are displayed in a responsive grid layout using the MovieCard component.
 *
 * @component
 * @returns {JSX.Element} A grid of movie cards.
 */
const SearchAndMovies = () => {
  /** @type {[Array, Function]} movies - State to store the list of movies from the API */
  const [movies, setMovies] = useState([]);

  /**
   * useEffect hook to fetch all movie data from the backend when the component is mounted.
   */
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/movies')
      .then(response => {
        setMovies(response.data);  // ✅ Save movie list to state
      })
      .catch(error => {
        console.error('Error fetching movies:', error);  // ❌ Log errors if request fails
      });
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '2rem'
    }}>
      {/* Render MovieCard for each movie in the state */}
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default SearchAndMovies;
