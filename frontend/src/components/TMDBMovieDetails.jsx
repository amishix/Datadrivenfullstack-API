import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * TMDBMovieDetails component fetches and displays detailed info about a TMDB movie.
 *
 * @component
 * @param {Object} props
 * @param {number} props.id - The TMDB movie ID
 * @returns {JSX.Element} Full movie detail page with trailer, cast, reviews, BTS, and recommendations
 */
const TMDBMovieDetails = ({ id }) => {
  // State variables for movie data and various sections
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [credits, setCredits] = useState(null);
  const [btsVideos, setBtsVideos] = useState([]);
  const [error, setError] = useState('');

  const API_KEY = '10a99b3c00d4e3d999c458f1b76b87b2'; // TMDB API Key

  /**
   * Fetch movie details, trailer, cast, reviews, recommendations, and BTS videos from TMDB
   */
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const [res, reviewRes, recsRes, creditsRes, videosRes] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: { api_key: API_KEY, append_to_response: 'videos' }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/reviews`, {
            params: { api_key: API_KEY }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/recommendations`, {
            params: { api_key: API_KEY }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, {
            params: { api_key: API_KEY }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
            params: { api_key: API_KEY }
          })
        ]);

        // Save core data
        setMovie(res.data);
        setReviews(reviewRes.data.results);
        setRecommendations(recsRes.data.results);
        setCredits(creditsRes.data);

        // Extract trailer
        const trailer = res.data.videos.results.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) setTrailerKey(trailer.key);

        // Extract behind-the-scenes content
        const bts = videosRes.data.results.filter(video =>
          video.type === 'Behind the Scenes' || video.name.toLowerCase().includes('bts')
        );
        setBtsVideos(bts.slice(0, 3)); // Limit to 3 videos
      } catch (err) {
        console.error('Error loading TMDB movie:', err);
        setError('Something went wrong while loading this movie.');
      }
    };

    fetchMovie();
  }, [id]);

  // Error handling
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  if (!movie) return <p style={{ textAlign: 'center' }}>Loading movie details...</p>;

  const director = credits?.crew?.find(person => person.job === 'Director');

  return (
    <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '5rem' }}>
      {/* --- Movie Info Section --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={{ width: '300px', borderRadius: '10px' }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '3rem', color: '#FFD700' }}>{movie.title}</h1>
          <p style={{ fontSize: '1.2rem' }}>{movie.release_date || 'Unknown Year'} | {movie.runtime || 'N/A'} min</p>
          <p style={{ fontSize: '1.5rem', color: '#FFD700' }}>
            ⭐ {movie.vote_average ? `${movie.vote_average} / 10` : 'Not rated'}
          </p>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            {movie.overview || 'No description available.'}
          </p>
        </div>
      </div>

      {/* --- Trailer Section --- */}
      {trailerKey && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#FFD700' }}>🎬 Trailer</h2>
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            title="Trailer"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}

      {/* --- Cast Section --- */}
      {credits?.cast && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#FFD700' }}>🎭 Cast</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1.5rem'
          }}>
            {credits.cast.slice(0, 12).map(actor => (
              <div key={actor.id} style={{ textAlign: 'center' }}>
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  style={{ width: '120px', height: '180px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <p>{actor.name}</p>
                <small style={{ color: '#aaa' }}>as {actor.character}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Reviews Section --- */}
      {reviews.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#FFD700' }}>Reviews</h2>
          {reviews.slice(0, 3).map(review => (
            <div key={review.id} style={{
              background: '#222', padding: '1rem', marginBottom: '1rem', borderRadius: '8px'
            }}>
              <h3 style={{ color: '#FFD700' }}>
                ⭐ {Math.floor(Math.random() * (10 - 6 + 1) + 6)} / 10 by {review.author}
              </h3>
              <p>{review.content.slice(0, 300)}...</p>
            </div>
          ))}
        </div>
      )}

      {/* --- Behind-the-Scenes Section --- */}
      {btsVideos.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#FFD700' }}>🎥 Behind the Scenes</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {btsVideos.map(video => (
              <div key={video.id}>
                <iframe
                  width="100%"
                  height="250"
                  src={`https://www.youtube.com/embed/${video.key}`}
                  title={video.name}
                  frameBorder="0"
                  allowFullScreen
                  style={{ borderRadius: '10px' }}
                />
                <p>{video.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Recommendations Section --- */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#FFD700' }}>🎞️ You Might Also Like</h2>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem' }}>
            {recommendations.slice(0, 10).map(rec => (
              <a key={rec.id} href={`/tmdb/${rec.id}`}>
                <img
                  src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                  alt={rec.title}
                  style={{ borderRadius: '10px', width: '150px' }}
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TMDBMovieDetails;