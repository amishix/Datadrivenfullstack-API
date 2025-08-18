import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * GenreRow component displays a horizontally scrollable list of movies for each genre.
 * It also includes a "See All" button that links to a full genre-specific page.
 *
 * @component
 * @returns {JSX.Element} The rendered genre rows section.
 */
const GenreRow = () => {
  /** @type {[Array, Function]} genres - List of genre objects fetched from the API */
  const [genres, setGenres] = useState([]);

  /** @type {[Object, Function]} moviesByGenre - Map of genre name to list of movies */
  const [moviesByGenre, setMoviesByGenre] = useState({});

  /**
   * Fetches all genres and corresponding movies from the API on component mount.
   */
  useEffect(() => {
    const fetchGenresAndMovies = async () => {
      try {
        console.log("🔍 GenreRow mounted");

        // Fetch all genres
        const genreRes = await axios.get('http://localhost:5050/genres');
        console.log("✅ Genres:", genreRes.data);
        setGenres(genreRes.data);

        // Fetch movies for each genre
        const movieMap = {};
        for (const genre of genreRes.data) {
          const res = await axios.get(`http://localhost:5050/genres/${genre.id}/movies`);
          movieMap[genre.name] = res.data;
          console.log(`🎬 ${genre.name}:`, res.data.length, "movies");
        }

        setMoviesByGenre(movieMap);
      } catch (error) {
        console.error("❌ Error fetching genres or movies:", error);
      }
    };

    fetchGenresAndMovies();
  }, []);

  // Show loading message while genres are being fetched
  if (!genres.length) {
    return <p style={{ color: 'white', textAlign: 'center' }}>🔄 Loading genres...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>
      {genres.map((genre) => (
        <div key={genre.id}>
          {/* Genre title and See All button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#FFD700' }}>{genre.name}</h3>
            <a
              href={`/genres/all?name=${encodeURIComponent(genre.name)}`}  // Link using genre name
              style={{
                backgroundColor: '#000',
                color: '#FFD700',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              See All →
            </a>
          </div>

          {/* Scrollable horizontal row of movie posters */}
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '1rem',
            paddingBottom: '1rem',
          }}>
            {moviesByGenre[genre.name]?.map((movie) => (
              <a key={movie.id} href={`/movies/${movie.id}`} style={{ flex: '0 0 auto' }}>
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  style={{
                    width: '150px',
                    height: '225px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenreRow;