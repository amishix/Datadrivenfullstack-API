import { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';

const GenreMovies = ({ id }) => {
  const [movies, setMovies] = useState([]);
  const [genreName, setGenreName] = useState('');

  useEffect(() => {
    // Fetch all movies for this genre
    axios.get(`http://127.0.0.1:5000/genres/${id}/movies`)
      .then(response => setMovies(response.data))
      .catch(error => console.error('Error fetching movies:', error));

    // Fetch genre name separately
    axios.get(`http://127.0.0.1:5000/genres`)
      .then(response => {
        const genre = response.data.find(g => g.id.toString() === id.toString());
        if (genre) setGenreName(genre.name);
      })
      .catch(error => console.error('Error fetching genre name:', error));
  }, [id]);

  if (!movies.length) {
    return <p style={{ color: '#fff', textAlign: 'center' }}>Loading movies...</p>;
  }

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      {/* Back to homepage */}
      <button
        onClick={() => window.location.href = '/'}
        style={{
          backgroundColor: '#000',
          color: '#FFD700',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '2rem',
        }}
      >
        ← Back to Homepage
      </button>

      {/* Genre Heading */}
      <h1 style={{
        textAlign: 'center',
        color: '#FFD700',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        fontFamily: 'Bebas Neue, sans-serif',
        letterSpacing: '2px',
      }}>
        {genreName ? `${genreName} Movies` : 'Movies by Genre'}
      </h1>

      {/* Movie Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
      }}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default GenreMovies;
