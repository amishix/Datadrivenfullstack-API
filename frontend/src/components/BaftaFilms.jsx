import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard.jsx';
import MovieDetails from './MovieDetails.jsx';

const BaftaFilms = ({ title = "BAFTA Award-Winning Films" }) => {
  const [baftaMovies, setBaftaMovies] = useState([]);
  const [groupedMovies, setGroupedMovies] = useState({});
  const [decades, setDecades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    // Update the endpoint to match your API
    axios.get('http://127.0.0.1:5050/baftawinners')
      .then(response => {
        const movies = response.data;
        setBaftaMovies(movies);
        
        // Group movies by decade and year
        const grouped = groupMoviesByDecadeAndYear(movies);
        setGroupedMovies(grouped);
        
        // Extract and sort decades
        const decadesList = Object.keys(grouped)
          .sort((a, b) => b.localeCompare(a)); // Sort in descending order (newest first)
        setDecades(decadesList);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching BAFTA movies:', error);
        setError('Could not load BAFTA films. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Group movies by decade and year, separating winners and nominees
  const groupMoviesByDecadeAndYear = (movies) => {
    const grouped = {};
    
    // First pass: separate winners and nominees into their respective years
    movies.forEach(movie => {
      // Extract year from release_date (format: YYYY-MM-DD)
      const year = movie.bafta_winner_year?.toString() || 
             (movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown');
      
      // Determine decade (e.g., 2020 -> 2020s)
      const decade = year !== 'Unknown' ? `${Math.floor(parseInt(year) / 10) * 10}s` : 'Unknown';
      
      // Initialize decade and year if they don't exist
      if (!grouped[decade]) {
        grouped[decade] = {};
      }
      
      if (!grouped[decade][year]) {
        grouped[decade][year] = {
          winner: null,
          nominees: []
        };
      }
      
      // Check if this movie is a winner based on bafta_winner_year
      // If bafta_winner_year is present and matches the movie's year, it's the winner
      if (
        movie.is_bafta_winner === 1 || movie.is_bafta_winner === true
      ) {
        grouped[decade][year].winner = movie;
      } else {
        grouped[decade][year].nominees.push(movie);
      }
    });
    
    // Second pass: ensure each year has a winner if possible
    // This is a fallback in case bafta_winner_year isn't set properly
    Object.keys(grouped).forEach(decade => {
      Object.keys(grouped[decade]).forEach(year => {
        // If no winner is designated but we have nominees, use the highest-rated as winner
        if (!grouped[decade][year].winner && grouped[decade][year].nominees.length > 0) {
          console.log(`No explicit winner for ${year}, using highest-rated movie as winner`);
          
          // Sort nominees by vote_average (descending)
          grouped[decade][year].nominees.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
          
          // Move the highest-rated to be the winner
          grouped[decade][year].winner = grouped[decade][year].nominees.shift();
        }
      });
    });
    
    // Sort years within each decade (descending)
    Object.keys(grouped).forEach(decade => {
      grouped[decade] = Object.fromEntries(
        Object.entries(grouped[decade])
          .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
      );
    });
    
    return grouped;
  };

  // Handler for clicking on a movie card
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    window.scrollTo(0, 0); // Scroll to top when viewing details
  };

  // Handler for returning to the grid view
  const handleBackClick = () => {
    setSelectedMovie(null);
  };
  
  // Count movies in a decade
  const countMoviesInDecade = (decade) => {
    return Object.values(groupedMovies[decade])
      .reduce((count, yearData) => {
        // Count winner (if exists) and all nominees
        const winnerCount = yearData.winner ? 1 : 0;
        return count + winnerCount + yearData.nominees.length;
      }, 0);
  };

  // If a movie is selected, show its details
  if (selectedMovie) {
    return (
      <div className="movie-details-container">
        <button 
          onClick={handleBackClick}
          style={{
            background: '#FFD700',
            color: '#111',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to BAFTA Films
        </button>
        
        <MovieDetails id={selectedMovie.id} />
      </div>
    );
  }

  // Otherwise, show the grouped movies
  return (
    <div className="bafta-films-container">
      <div className="bafta-header" style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: '#FFD700',
          marginBottom: '1rem'
        }}>{title}</h2>
        <p style={{ 
          color: '#ccc', 
          maxWidth: '800px', 
          margin: '0 auto',
          fontSize: '1.1rem'
        }}>
          Explore the prestigious BAFTA award-winning films that represent the best of British and international cinema.
        </p>
      </div>

      {/* Jump to Year Filter */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <label htmlFor="yearSelect" style={{ color: '#ccc', marginRight: '1rem' }}>
          Jump to Year:
        </label>
        <select
          id="yearSelect"
          onChange={(e) => {
            const year = e.target.value;
            const el = document.getElementById(`year-${year}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '5px',
            border: '1px solid #555',
            background: '#111',
            color: '#fff'
          }}
        >
          <option value="">Select a Year</option>
          {decades.flatMap(decade =>
            Object.keys(groupedMovies[decade] || {})
              .sort((a, b) => b - a)
              .map((year) => (
                <option key={year} value={year}>{year}</option>
              ))
          )}
        </select>
      </div>
      
      {error && (
        <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>
          <p>{error}</p>
        </div>
      )}
      
      {loading && !error && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.2rem' }}>⏳ Loading BAFTA films...</p>
        </div>
      )}
      
      {!loading && !error && baftaMovies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No BAFTA films found. Check back later!</p>
        </div>
      )}
      
      {!loading && !error && decades.map(decade => (
        <div 
          key={decade} 
          className="decade-section"
          style={{
            marginBottom: '3rem',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Decade Header */}
          <div 
            className="decade-header"
            style={{
              background: 'linear-gradient(90deg, #111 0%, #222 100%)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #FFD700',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2 style={{ color: '#FFD700', margin: 0 }}>
              {decade}
            </h2>
            <span style={{ 
              color: '#ccc', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px', 
              fontSize: '0.9rem' 
            }}>
              {countMoviesInDecade(decade)} films
            </span>
          </div>
          
          {/* Years within decade */}
          {Object.entries(groupedMovies[decade]).map(([year, yearData]) => {
            // Calculate total films in this year
          const totalFilms = (yearData.winner ? 1 : 0) + yearData.nominees.length;

          return (
            <div 
              key={year} 
              id={`year-${year}`} //  Added for scrollIntoView
              className="year-section"
              style={{ marginBottom: '2rem' }}
            >

                {/* Year Header */}
                <h3 style={{ 
                  color: '#eee', 
                  borderBottom: '1px solid #333',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{year}</span>
                  <span style={{ 
                    color: '#999', 
                    fontSize: '0.9rem',
                    fontWeight: 'normal'
                  }}>
                    {totalFilms} {totalFilms === 1 ? 'film' : 'films'}
                  </span>
                </h3>
                
                {/* Winner Section */}
                {yearData.winner && (
                  <div 
                    style={{
                      marginBottom: '2rem',
                    }}
                  >
                    <h4 style={{
                      color: '#FFD700',
                      borderLeft: '4px solid #FFD700',
                      paddingLeft: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '1.1rem'
                    }}>
                      WINNER
                    </h4>
                    
                    <div 
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        marginBottom: '1.5rem'
                      }}
                    >
                      <div 
                        key={yearData.winner.id} 
                        onClick={() => handleMovieClick(yearData.winner)}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          maxWidth: '250px',
                          position: 'relative'
                        }}
                        className="movie-card-wrapper"
                      >
                        {/* Winner badge */}
                        <div style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          zIndex: 10,
                          background: '#FFD700',
                          color: '#111',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}>
                          BAFTA
                        </div>
                        <MovieCard movie={yearData.winner} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Nominees Section */}
                {yearData.nominees.length > 0 && (
                  <div>
                    <h4 style={{
                      color: '#ccc',
                      borderLeft: '4px solid #666',
                      paddingLeft: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '1.1rem'
                    }}>
                      NOMINEES
                    </h4>
                    
                    {/* Nominees Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '1.5rem',
                      padding: '0.5rem'
                    }}>
                      {yearData.nominees.map((movie) => (
                        <div 
                          key={movie.id} 
                          onClick={() => handleMovieClick(movie)}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            opacity: '0.85'
                          }}
                          className="movie-card-wrapper"
                        >
                          <MovieCard movie={movie} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BaftaFilms;