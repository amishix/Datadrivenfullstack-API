import React from 'react';
import './FilmCarousel.css';

// carousel of film cards
export default function FilmCarousel({ films }) {
  // show message if no films
  if (!films?.length) {
    return <p className="no-films">No films to show.</p>;
  }

  return (
    // outer container for carousel
    <div className="carousel-container">
      <div className="carousel-track">
        {/* loop through films */}
        {films.map((film) => {
          // determine id for tmdb link
          const tmdbId = film.id ?? film.movie_id;
          // card content
          const card = (
            <div className="film-card">
              <img
                src={film.poster_url || '/placeholder.jpg'}
                alt={film.title}
              />
              <div className="film-info">
                <h3>{film.title}</h3>
               {/* awards badge */}
                <span className="badge">
                  🏆 {film.wins ?? film.oscars?.length ?? 0} Awards
                </span>
               {/* release year */}
                {film.release_date && (
  <p className="year">{film.release_date.split('-')[0]}</p>
)}
              </div>
            </div>
          );
          // wrap card in link if tmdbId exists
          return tmdbId ? (
            <a
              key={tmdbId}
              href={`/tmdb/${tmdbId}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {card}
            </a>
          ) : (
            <div key={film.title}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
