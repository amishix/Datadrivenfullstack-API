import { useState, useEffect } from 'react';

// find matching quote by year, category and recipient
const getQuote = (year, category, recipient) => {
  return quotes.find(
    q =>
      q.year === year &&
      q.category.toLowerCase() === category.toLowerCase() &&
      q.recipient.toLowerCase() === recipient?.toLowerCase()
  );
};

const QuoteDisplay = ({ year, category, recipient }) => {
  // toggle quote visibility
  const [show, setShow] = useState(false);
  // select quote based on inputs
  const quote = getQuote(year, category, recipient);
  // no quote to show
  if (!quote) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* toggle button */}
      <button
        onClick={() => setShow(prev => !prev)}
        style={{
          backgroundColor: '#FFD700',
          border: 'none',
          borderRadius: '4px',
          padding: '0.3rem 0.75rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        {show ? 'Hide Quote' : 'View Quote'}
      </button>
      
      {/* display quote when toggled */}
      {show && (
        <blockquote
          style={{
            marginTop: '0.5rem',
            padding: '1rem',
            background: '#111',
            borderLeft: '4px solid #FFD700',
            borderRadius: '6px',
            color: '#FFD700',
            fontStyle: 'italic',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)'
          }}
        >
          “{quote.quote}”
          <footer
            style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#bbb' }}
          >
            — {quote.recipient}, {quote.category}, {quote.year}
          </footer>
        </blockquote>
      )}
    </div>
  );
};

export default QuoteDisplay;
