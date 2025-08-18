import { useState } from 'react';

/**
 * SearchBar component allows users to input a movie title and trigger a search action.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onSearch - Callback function triggered with the input string.
 * @returns {JSX.Element} A styled search bar with input and button.
 */
const SearchBar = ({ onSearch }) => {
  /** @type {[string, Function]} input - State for the user's search input */
  const [input, setInput] = useState('');

  /**
   * Triggers the search if the input is not empty.
   */
  const handleSearch = () => {
    if (input.trim() !== '') {
      onSearch(input.trim());
    }
  };

  /**
   * Executes search when the Enter key is pressed.
   *
   * @param {Object} e - Keyboard event.
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#222',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
    }}>
      {/* Search icon */}
      <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>🔍</span>

      {/* Text input for movie title */}
      <input 
        type="text"
        placeholder="Search Movies..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{
          flex: 1,
          padding: '0.5rem',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          background: '#222',
          color: '#eee',
          outline: 'none'
        }}
      />

      {/* Search button */}
      <button
        onClick={handleSearch}
        style={{
          background: '#FFD700',
          border: 'none',
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          color: '#111'
        }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;