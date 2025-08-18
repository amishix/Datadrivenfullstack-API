import { useState, useEffect } from 'react';
// component for searching and exploring oscar data
export default function OscarExplorer({ data }) {
  // search input value
  const [searchQuery, setSearchQuery] = useState("");
  // oscar quotes loaded from public json
  const [quotes, setQuotes] = useState([]);

  // load quotes on mount
  useEffect(() => {
    fetch('/oscar_quotes.json')
      .then(res => res.json())
      .then(setQuotes)
      .catch(console.error);
  }, []);

  // normalise text for case/space-insensitive match
  const normalize = str => str?.toLowerCase().trim();
  // find matching quote for given year/category/recipient
  const getQuote = (year, category, recipient) =>
    quotes.find(
      q =>
        q.year === Number(year) &&
        normalize(q.category) === normalize(category) &&
        normalize(q.recipient) === normalize(recipient)
    );

  // filter data by search query
  const filtered = data.reduce((acc, [year, awards]) => {
    const matches = awards.filter(a =>
      a.film?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.recipient?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matches.length) acc.push([year, matches]);
    return acc;
  }, []);

 

  return (
    <div>
      {/* search input */}
      <input
        type="text"
        placeholder="Search by film, category, or recipient..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '0.75rem', width: '100%', maxWidth: '500px', marginBottom: '2rem', fontSize: '1rem', borderRadius: '6px' }}
      />
      {/* no results message */}
      {filtered.length === 0 && <p>No results found.</p>}
      {/* display filtered sections */}
      {filtered.map(([year, awards]) => (
        <section key={year} id={`year-${year}`}>
          {/* year header */}
          <h2 style={{ fontSize: '2rem', color: '#f3f3f3', borderBottom: '2px solid gold', marginTop: '3rem', paddingBottom: '0.25rem' }}>
            {year}
          </h2>
          {awards.map(a => {
            // quote for this award if available
            const quote = getQuote(a.year, a.category, a.recipient);
            {quote && (
              <blockquote style={{
                fontStyle: 'italic',
                color: '#FFD700',
                marginTop: '0.75rem',
                background: '#111',
                padding: '1rem',
                borderLeft: '4px solid #FFD700',
                borderRadius: '8px'
              }}>
                “{quote.quote}”
                <footer style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#ccc' }}>
                  — {quote.recipient}, {quote.category}, {quote.year}
                </footer>
              </blockquote>
            )}


            return (
              <div
                key={a.id}
                className="card"
                style={{
                  background: '#1a1a1a',
                  padding: '1rem',
                  margin: '1rem 0',
                  borderLeft: '4px solid gold',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  gap: '1rem'
                }}
              >
               {/* poster image */}
                {a.poster_url && (
                  <img src={a.poster_url} alt={`Poster for ${a.film}`} className="poster" style={{ width: '150px', height: '225px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                )}
                {/* award details */}
                <div className="card-content" style={{ flex: 1 }}>
                  {/* category and quote icon */}
                  <div className="category" style={{ color: '#ccc', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {a.category}
                    {quote && <span title="Acceptance quote available" style={{ marginLeft: '0.5rem' }}>🗣️</span>}
                  </div>
                  {/* recipient name */}
                  <div className="recipient" style={{ fontSize: '1.2rem', fontWeight: 600 }}>{a.recipient}</div>
                  {/* film title link */}
                  <div className="film" style={{ fontStyle: 'italic', color: '#bbb' }}>
                    <a href="#" style={{ color: 'gold', textDecoration: 'underline' }}>
                      {a.film}
                    </a>
                  </div>
                  {/* display quote block if available */}
                  {quote && (
                    <blockquote style={{
                      fontStyle: 'italic',
                      color: '#FFD700',
                      marginTop: '0.75rem',
                      background: '#111',
                      padding: '1rem',
                      borderLeft: '4px solid #FFD700',
                      borderRadius: '8px'
                    }}>
                      “{quote.quote}”
                      <footer style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#ccc' }}>
                        — {quote.recipient}, {quote.category}, {quote.year}
                      </footer>
                    </blockquote>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
