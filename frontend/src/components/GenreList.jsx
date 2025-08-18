import { useState, useEffect } from 'react';
import axios from 'axios';

// Component to fetch and display a list of genres as clickable links
const GenreList = () => {
  const [genres, setGenres] = useState([]); // State to hold genres data

  // useEffect runs once on component mount to fetch genres from the API
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/genres') // Fetch genres from Flask backend
      .then(response => {
        setGenres(response.data); // Update state with the fetched genres
      })
      .catch(error => {
        console.error('Error fetching genres:', error); // Log any errors
      });
  }, []); // Empty dependency array ensures this runs only once

  // Show a loading message while genres are being fetched
  if (!genres.length) {
    return <p>Loading genres...</p>;
  }

  return (
    // Container for genre buttons styled as clickable blocks
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {genres.map((genre) => (
        <a 
          key={genre.id}
          href={`/genres/${genre.id}`} // Link to genre-specific page
          style={{
            padding: '1rem',
            border: '1px solid black',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'black'
          }}
        >
          {genre.name} {/* Display the genre name */}
        </a>
      ))}
    </div>
  );
};

export default GenreList;
