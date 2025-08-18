import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

/**
 * React component to show movies by genre with:
 * - Display of existing rating as stars (non-emoji)
 * - User rating input (clickable stars)
 * - Mark as watched toggle with cleaner font
 * - Sorting options
 * - Poster highlight on hover
 */
const GenreMoviesByName = () => {
  const [name, setName] = useState('');
  const [movies, setMovies] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [watchedMovies, setWatchedMovies] = useState(new Set());
  const [sortBy, setSortBy] = useState('alphabetical');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genreFromURL = params.get('name');
    setName(genreFromURL);

    const fetchGenreMovies = async () => {
      try {
        const genreRes = await axios.get('http://localhost:5050/genres');
        const genre = genreRes.data.find(
          (g) => g.name.toLowerCase() === genreFromURL?.toLowerCase()
        );
        if (!genre) {
          console.error('❌ Genre not found:', genreFromURL);
          return;
        }
        const movieRes = await axios.get(
          `http://localhost:5050/genres/${genre.id}/movies`
        );
        setMovies(movieRes.data);
      } catch (error) {
        console.error('❌ Error fetching movies by genre name:', error);
      }
    };

    if (genreFromURL) {
      fetchGenreMovies();
    }
  }, []);

  // Handle user star rating
  const handleRatingChange = (movieId, rating) => {
    setUserRatings((prev) => ({ ...prev, [movieId]: rating }));
  };

  // Toggle watched/unwatched
  const handleToggleWatched = (movieId) => {
    setWatchedMovies((prev) => {
      const updated = new Set(prev);
      if (updated.has(movieId)) {
        updated.delete(movieId);
      } else {
        updated.add(movieId);
      }
      return updated;
    });
  };

  // Sort movies
  const sortedMovies = useMemo(() => {
    if (!movies.length) return [];
    const moviesCopy = [...movies];
    switch (sortBy) {
      case 'highestRated':
        return moviesCopy.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'mostWatched':
        return moviesCopy.sort((a, b) => {
          const aWatched = watchedMovies.has(a.id) ? 1 : 0;
          const bWatched = watchedMovies.has(b.id) ? 1 : 0;
          return bWatched - aWatched;
        });
      case 'alphabetical':
      default:
        return moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [movies, sortBy, watchedMovies]);

  // Helper: render stars for existing rating (vote_average out of 10 converted to 5 stars)
  const renderExistingStars = (vote_average) => {
    const starsCount = Math.round((vote_average || 0) / 2);
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        style={{
          color: i < starsCount ? '#FFD700' : '#555',
          fontSize: '1.3rem',
          userSelect: 'none',
          fontFamily: 'Bebas Neue, sans-serif',
          marginRight: '2px',
        }}
      >
        {i < starsCount ? '★' : '☆'}
      </span>
    ));
  };

  // Render user rating stars (clickable)
  const renderUserRatingStars = (movieId) => {
    const currentRating = userRatings[movieId] || 0;
    return [...Array(5)].map((_, i) => {
      const starNum = i + 1;
      return (
        <span
          key={i}
          onClick={() => handleRatingChange(movieId, starNum)}
          style={{
            cursor: 'pointer',
            color: starNum <= currentRating ? '#FFD700' : '#555',
            fontSize: '1.5rem',
            userSelect: 'none',
            fontFamily: 'Bebas Neue, sans-serif',
            marginRight: '4px',
            transition: 'color 0.2s',
          }}
          role="button"
          aria-label={`Rate ${starNum} star${starNum > 1 ? 's' : ''}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRatingChange(movieId, starNum);
            }
          }}
        >
          ★
        </span>
      );
    });
  };

  if (!movies.length) {
    return (
      <p style={{ color: '#fff', textAlign: 'center' }}>
        No movies found for “{name}”.
      </p>
    );
  }

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', padding: '2rem' }}>
      <button
        onClick={() => (window.location.href = '/')}
        style={{
          backgroundColor: '#000',
          color: '#FFD700',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '1rem',
          fontFamily: 'Bebas Neue, sans-serif',
          letterSpacing: '1px',
          fontSize: '1.1rem',
        }}
      >
        ← Back to Homepage
      </button>

      <h1
        style={{
          textAlign: 'center',
          color: '#FFD700',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontFamily: 'Bebas Neue, sans-serif',
          letterSpacing: '2px',
        }}
      >
        {name} Movies
      </h1>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <label
          htmlFor="sort-select"
          style={{
            marginRight: '0.5rem',
            fontFamily: 'Bebas Neue, sans-serif',
            color: '#FFD700',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          Sort by:
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#000',
            color: '#FFD700',
            fontWeight: 'bold',
            fontFamily: 'Bebas Neue, sans-serif',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="highestRated">Highest Rated</option>
          <option value="mostWatched">Most Watched</option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}
      >
        {sortedMovies.map((movie) => (
          <div
            key={movie.id}
            style={{
              backgroundColor: '#222',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'Bebas Neue, sans-serif',
              transition: 'transform 0.3s ease',
            }}
            // Add hover transform effect to highlight poster
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 15px 5px #FFD700';
              e.currentTarget.style.zIndex = 10;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.zIndex = 1;
            }}
          >
            <a href={`/movies/${movie.id}`} style={{ width: '100%' }}>
              <img
                src={movie.poster_url}
                alt={movie.title}
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  transition: 'box-shadow 0.3s ease',
                }}
              />
            </a>

            <h3 style={{ color: '#FFD700', marginTop: '0.5rem' }}>{movie.title}</h3>

            <p style={{ fontSize: '0.9rem', minHeight: '3.5em' }}>
              {movie.overview
                ? `${movie.overview.slice(0, 100)}...`
                : 'No overview available.'}
            </p>

            {/* Numeric rating BEFORE stars with smaller font */}
            <div
              style={{
                marginTop: '0.3rem',
                userSelect: 'none',
                color: '#FFD700',
                fontFamily: 'Bebas Neue, sans-serif',
                fontWeight: 'bold',
                fontSize: '0.75rem',  // smaller font here
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '6px',   // spacing from stars
              }}
              aria-label={`Current rating: ${movie.vote_average}/10`}
              title={`Current rating: ${movie.vote_average}/10`}
            >
              ({movie.vote_average?.toFixed(1)}/10)
            </div>

            {/* Existing rating stars */}
            <div
              style={{
                marginTop: '0.3rem',
                userSelect: 'none',
                display: 'inline-block',
                marginLeft: '0.5rem',
                verticalAlign: 'middle',
              }}
            >
              {renderExistingStars(movie.vote_average)}
            </div>

            {/* User rating input */}
            <div
              style={{
                marginTop: '0.7rem',
                fontSize: '0.9rem',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <label
                style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  color: '#FFD700',
                  fontWeight: 'normal', // normal font for "Your Rating"
                  marginRight: '6px',
                  alignSelf: 'center',
                  userSelect: 'none',
                }}
              >
                Your Rating:
              </label>
              {renderUserRatingStars(movie.id)}
            </div>

            {/* Watched toggle */}
            <button
              onClick={() => handleToggleWatched(movie.id)}
              style={{
                marginTop: '1rem',
                padding: '0.6rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: watchedMovies.has(movie.id) ? '#FFD700' : '#555',
                color: watchedMovies.has(movie.id) ? '#000' : '#fff',
                fontWeight: 'normal', // normal font for "Mark as Watched"
                cursor: 'pointer',
                fontFamily: 'Bebas Neue, sans-serif',
                letterSpacing: '1px',
                fontSize: '0.9rem',
              }}
            >
              {watchedMovies.has(movie.id) ? 'Watched ✓' : 'Mark as Watched'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreMoviesByName;