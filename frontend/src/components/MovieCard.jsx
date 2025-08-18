/**
 * MovieCard component displays a single movie card with poster and title.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.movie - Movie object containing poster URL and title.
 * @param {string} props.movie.poster_url - URL of the movie's poster image.
 * @param {string} props.movie.title - Title of the movie.
 * @returns {JSX.Element} A styled card containing the movie poster and title.
 */
const MovieCard = ({ movie }) => {
  return (
    <div style={{
      background: '#111',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    }}>
      {/* Movie Poster */}
      <img
        src={movie.poster_url}
        alt={movie.title}
        style={{ width: '100%', height: '300px', objectFit: 'cover' }}
      />

      {/* Movie Title */}
      <div style={{ padding: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#eee', margin: '0.5rem 0' }}>
          {movie.title}
        </h3>
      </div>
    </div>
  );
};

export default MovieCard;
  