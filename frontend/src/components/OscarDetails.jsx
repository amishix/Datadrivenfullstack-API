import { useState, useEffect } from 'react';
import axios from 'axios';
import './OscarStyle.css';

// component to fetch and display movie details and oscars
export default function OscarDetails({ id }) {
  // fetched data object
  const [data, setData] = useState(null);
  // error state
  const [error, setError] = useState(null);
  // load data on id change
  useEffect(() => {
    // determine if id is numeric or title
    const isNumeric = /^\d+$/.test(id);
    const param = isNumeric
      ? `movie_id=${id}`
      : `title=${encodeURIComponent(id)}`;
    // api base url from env or fallback
    const apiBase = import.meta.env.PUBLIC_API_URL || 'http://localhost:5050';
    // fetch details with axios
    axios.get(`${apiBase}/api/film_details?${param}`)
      .then(res => {
        console.log("Fetched movie data:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error("Error loading movie details:", err);
        setError(err);
      });
  }, [id]);
  // show error or loading states
  if (error) return <p>Failed to load details.</p>;
  if (!data) return <p>Loading…</p>;
  // destructure api response
  const {
    title,
    overview,
    poster_url,
    release_date,
    vote_average,
    oscars = [],
    tmdb_id
  } = data;

  return (
    <div className="oscar-details">
      <div className="oscar-header">
        {/* poster image */}
        {poster_url && (
          <img
            src={poster_url}
            alt={`Poster for ${title}`}
            className="oscar-poster"
          />
        )}
        <div className="oscar-meta">
          {/* title and overview */}
          <h1>{title}</h1>
          <p>{overview}</p>
          {/* release date and rating */}
          <p><strong>Released:</strong> {release_date}</p>
          <p><strong>Rating:</strong> {vote_average}</p>
          {/* link to tmdb page */}
          <a
            href={`https://www.themoviedb.org/movie/${tmdb_id || 550}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tmdb-button"
          >
            View on TMDB →
          </a>
          {/* show raw tmdb id for debugging */}
          <pre style={{ color: '#ccc' }}>tmdb_id: {tmdb_id}</pre>
        </div>
      </div>
      {/* oscars list section */}
      <section className="oscars-list">
        <h2>Oscar Awards and Nominations</h2>
        {oscars.length > 0 ? (
          <ul>
            {oscars.map(award => (
              <li key={award.id}>
                <strong>{award.year}</strong> — {award.category}
                {award.winner && ' 🏆'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No Oscar awards found for this film.</p>
        )}
      </section>
    </div>
  );
}
