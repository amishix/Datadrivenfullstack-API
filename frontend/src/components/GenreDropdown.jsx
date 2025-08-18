import { useState } from 'react';

// Dropdown component to select and navigate to different genre-based pages
const GenreDropdown = () => {
  const [selected, setSelected] = useState(''); // Tracks the selected genre

  // List of genre options for the dropdown
  const genres = [
    { label: 'Select Category', value: '' },
    { label: 'Action', value: 'action' },
    { label: 'Comedy', value: 'comedy' },
    { label: 'Drama', value: 'drama' },
    { label: 'Bond Collection', value: 'bond' },
    { label: 'Oscar Winners', value: 'oscars' },
  ];

  // Handle selection change and navigate to appropriate route
  const handleChange = (e) => {
    const selectedGenre = e.target.value;
    setSelected(selectedGenre); // Update the selected genre state

    // Navigate to dedicated pages based on genre
    if (selectedGenre === 'bond') {
      window.location.href = '/bondcollection';
    } else if (selectedGenre === 'oscars') {
      window.location.href = '/oscarwinners';
    } else if (selectedGenre) {
      window.location.href = `/genres/${selectedGenre}`; // Default route for general genres
    }
  };

  return (
    <select 
      value={selected}
      onChange={handleChange}
      style={{
        padding: '0.8rem',
        borderRadius: '10px',
        border: 'none',
        fontSize: '1rem',
        backgroundColor: '#222',
        color: '#eee',
        width: '300px'
      }}
    >
      {/* Render dropdown options from genres list */}
      {genres.map((genre) => (
        <option key={genre.value} value={genre.value}>
          {genre.label}
        </option>
      ))}
    </select>
  );
};

export default GenreDropdown;
