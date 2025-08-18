import { useEffect, useState } from 'react';
import axios from 'axios';

const TMDB_API_KEY = '10a99b3c00d4e3d999c458f1b76b87b2';

/**
 * MovieDetails component fetches and displays rich details about a movie,
 * including trailer, cast, director, reviews, and behind-the-scenes clips.
 *
 * @component
 * @param {Object} props - Props passed to MovieDetails.
 * @param {number} props.id - Local database movie ID to fetch and enrich.
 * @returns {JSX.Element} The rendered detailed movie view.
 */
const MovieDetails = ({ id }) => {
  const [movie, setMovie] = useState(null);
  const [tmdbId, setTmdbId] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [credits, setCredits] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [btsVideos, setBtsVideos] = useState([]);

  /**
   * useEffect fetches local movie data, then enriches it with TMDB information.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get local movie data
        const localRes = await axios.get(`http://localhost:5050/movies/${id}`);
        const movieData = localRes.data;
        setMovie(movieData);

        // Step 2: Search TMDB for the movie by title
        const searchRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
          params: { api_key: TMDB_API_KEY, query: movieData.title }
        });

        const match = searchRes.data.results[0];
        if (!match) return;
        setTmdbId(match.id);

        // Step 3: Fetch additional TMDB data (videos, cast/crew, reviews)
        const [videoRes, creditsRes, reviewRes] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${match.id}/videos`, { params: { api_key: TMDB_API_KEY } }),
          axios.get(`https://api.themoviedb.org/3/movie/${match.id}/credits`, { params: { api_key: TMDB_API_KEY } }),
          axios.get(`https://api.themoviedb.org/3/movie/${match.id}/reviews`, { params: { api_key: TMDB_API_KEY } }),
        ]);

        const trailerVid = videoRes.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const bts = videoRes.data.results.filter(v =>
          v.type === 'Behind the Scenes' || v.name.toLowerCase().includes('bts') || v.name.toLowerCase().includes('making')
        ).slice(0, 4);

        if (trailerVid) setTrailer(`https://www.youtube.com/embed/${trailerVid.key}`);
        setBtsVideos(bts);
        setCredits(creditsRes.data);
        setReviews(reviewRes.data.results || []);
      } catch (err) {
        console.error('❌ Error loading movie details:', err);
      }
    };

    fetchData();
  }, [id]);

  if (!movie) return <p style={{ color: 'white' }}>Loading...</p>;

  const director = credits?.crew?.find(person => person.job === 'Director');

  return (
    <div style={{
      color: '#eee',
      fontFamily: 'Bebas Neue, sans-serif',
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      
      {/* ── Poster and Info ───────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <img
          src={movie.poster_url}
          alt={movie.title}
          style={{ width: '300px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '3rem', color: '#FFD700' }}>{movie.title}</h1>
          <p style={{ fontSize: '1.2rem' }}>{movie.overview}</p>
          <p><strong>Release Date:</strong> {movie.release_date}</p>
          <p><strong>Rating:</strong> ⭐ {movie.vote_average} / 10</p>
        </div>
      </div>

      {/* ── Trailer ───────────────────────────── */}
      {trailer && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#FFD700' }}>Trailer</h2>
          <iframe
            width="100%"
            height="400"
            src={trailer}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '10px' }}
          />
        </div>
      )}

      {/* ── Cast ───────────────────────────── */}
      {credits?.cast && (
        <div>
          <h2 style={{ color: '#FFD700' }}>Cast</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {credits.cast.slice(0, 12).map(actor => (
              <div key={actor.id} style={{ textAlign: 'center' }}>
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  style={{ width: '100px', borderRadius: '8px' }}
                />
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{actor.name}</p>
                <small style={{ color: '#aaa' }}>as {actor.character}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Director ───────────────────────────── */}
      {director && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ color: '#FFD700' }}>Director</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={`https://image.tmdb.org/t/p/w300${director.profile_path}`}
              alt={director.name}
              style={{ width: '120px', height: '180px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <p style={{ fontSize: '1.4rem' }}>{director.name}</p>
          </div>
        </div>
      )}

      {/* ── Reviews ───────────────────────────── */}
      {reviews.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ color: '#FFD700' }}>Reviews</h2>
          {reviews.slice(0, 3).map(review => (
            <div key={review.id} style={{
              background: '#1a1a1a',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '1rem', color: '#FFD700' }}>
                ⭐ {review.author_details.rating || 'N/A'} / 10 by {review.author}
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                {review.content.length > 400
                  ? review.content.slice(0, 400) + '...'
                  : review.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Behind-the-Scenes ───────────────────────────── */}
      {btsVideos.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#FFD700' }}>Behind-the-Scenes Clips</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginTop: '1rem'
          }}>
            {btsVideos.map(video => (
              <div key={video.id}>
                <iframe
                  width="100%"
                  height="250"
                  src={`https://www.youtube.com/embed/${video.key}`}
                  title={video.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: '10px' }}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>{video.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;