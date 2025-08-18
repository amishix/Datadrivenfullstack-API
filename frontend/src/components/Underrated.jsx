import { useState, useEffect } from 'react';
import ReviewModal from './ReviewModal.jsx';
import './UnderratedStyle.css';

const API = import.meta.env.PUBLIC_API_URL || 'http://localhost:5050';

export default function Underrated() {
  // state for films list
  const [treasures, setTreasures] = useState([]);
  // state for search term
  const [filter, setFilter] = useState('');
  // state for sort option
  const [sortBy, setSortBy] = useState('vote_average');
  // state for modal visibility
  const [modalOpen, setModalOpen] = useState(false);
  // state for selected film id
  const [selectedFilmId, setSelectedFilmId] = useState(null);

  // get films 
  useEffect(() => {
    fetch(`${API}/api/underrated_treasures`)
      .then(r => r.json())
      .then(setTreasures)
      .catch(console.error);
  }, []);

  // apply filter & sort

  const visible = treasures
    .filter(t =>
      t.title.toLowerCase().includes(filter.toLowerCase()) &&
      t.title.toLowerCase() !== 'puri for rent'
    )
    .sort((a, b) => {
      const aVal = sortBy === 'release_date'
        ? Number(a.release_date)
        : Number(a[sortBy] || 0);
      const bVal = sortBy === 'release_date'
        ? Number(b.release_date)
        : Number(b[sortBy] || 0);
      return bVal - aVal;
    });

  return (
    <>
      <main className="underrated-page">
        {/* home link */}
        <a href="/" className="home-button">🏠</a>
        <h1 className="underrated-header">🌟 Hidden Treasures (8.0+)</h1>
        {/* search & sort controls */}
        <div className="search-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search titles…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <label className="sort-label">
            Sort by:
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="vote_average">Rating</option>
              <option value="release_date">Year</option>
            </select>
          </label>
        </div>
        {/* film cards grid */}
        <div className="film-grid">
          {visible.map(t => (
            <div key={t.id} className="film-card">
              {/* poster link */}
              <a
                href={`/tmdb/${t.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={t.poster_url || '/placeholder.jpg'}
                  alt={t.title}
                />
              </a>

              {/* card content */}
              <div className="film-card-content">
                <h2>{t.title}</h2>
                <p className="film-overview">
                  {t.overview || 'No description available.'}
                </p>
                <p className="film-rating">⭐ {t.vote_average}</p>
                <p className="film-release">{t.release_date}</p>
                <button
                  className="review-button"
                  onClick={() => {
                    setSelectedFilmId(t.id);
                    setModalOpen(true);
                  }}
                >
                  ✍ Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* review modal */}
      <ReviewModal
        filmId={selectedFilmId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
