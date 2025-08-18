
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  RadarChart, Radar, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BondCollection.css';

/** TMDB and OMDB API keys */
const TMDB_API_KEY = '10a99b3c00d4e3d999c458f1b76b87b2';
const OMDB_API_KEY = '293dc9f5';

/** Color palette for charts */
const COLORS = ['#FFD700', '#C0A16B', '#705848', '#F4E1B8', '#8B8000', '#DAA520'];

/** Array of Bond actors with their basic info and movies */
const bondActors = [
  { name: 'Sean Connery', birth: 'Edinburgh, Scotland, 1930', bio: 'Sean Connery was the first actor to portray James Bond...', movies: ['Dr. No', 'From Russia with Love', 'Goldfinger', 'Thunderball', 'You Only Live Twice', 'Diamonds Are Forever', 'Never Say Never Again'] },
  { name: 'George Lazenby', birth: 'Goulburn, Australia, 1939', bio: 'George Lazenby played Bond only once in "On Her Majesty\'s Secret Service".', movies: ["On Her Majesty's Secret Service"] },
  { name: 'Roger Moore', birth: 'London, England, 1927', bio: 'Roger Moore brought a light-hearted and stylish tone to Bond...', movies: ['Live and Let Die', 'The Man with the Golden Gun', 'The Spy Who Loved Me', 'Moonraker', 'For Your Eyes Only', 'Octopussy', 'A View to a Kill'] },
  { name: 'Timothy Dalton', birth: 'Colwyn Bay, Wales, 1946', bio: 'Timothy Dalton portrayed Bond with a darker realism...', movies: ['The Living Daylights', 'Licence to Kill'] },
  { name: 'Pierce Brosnan', birth: 'Drogheda, Ireland, 1953', bio: 'Pierce Brosnan’s Bond was elegant and action-driven...', movies: ['GoldenEye', 'Tomorrow Never Dies', 'The World Is Not Enough', 'Die Another Day'] },
  { name: 'Daniel Craig', birth: 'Chester, England, 1968', bio: 'Daniel Craig’s Bond is gritty and grounded...', movies: ['Casino Royale', 'Quantum of Solace', 'Skyfall', 'Spectre', 'No Time to Die'] }
];

/** Custom red icon for Leaflet markers */
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png'
});

/**
 * BondCollection React component displaying actors, movies,
 * charts and a map with filming locations.
 *
 * @returns {JSX.Element} The BondCollection component
 */
const BondCollection = () => {
  /** State to hold movies data grouped by actor */
  const [movieDataByActor, setMovieDataByActor] = useState({});

  /** State for chart data and settings */
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [chartDataset, setChartDataset] = useState('imdb');

  /** State to store actor images */
  const [actorImages, setActorImages] = useState({});

  /** State to track which movies user marked as watched */
  const [watchedMovies, setWatchedMovies] = useState({});

  /** State to store user ratings per movie */
  const [userRatings, setUserRatings] = useState({});

  /** State to track trivia dropdown visibility per movie */
  const [showTrivia, setShowTrivia] = useState({});

  /**
   * Fetches actor profile images and movie data from TMDB and OMDB APIs
   * Calculates aggregate stats for charts
   */
  useEffect(() => {
    const fetchData = async () => {
      const dataByActor = {};
      const stats = {};
      const images = {};

      for (const actor of bondActors) {
        try {
          // Fetch actor profile info
          const personRes = await axios.get('https://api.themoviedb.org/3/search/person', {
            params: { api_key: TMDB_API_KEY, query: actor.name }
          });
          const person = personRes.data.results?.[0];
          if (person?.profile_path) {
            images[actor.name] = `https://image.tmdb.org/t/p/w500${person.profile_path}`;
          }
        } catch {
          // Fail silently for actor image fetching
        }

        let imdbs = [], rts = [], metas = [], runtimes = [];
        dataByActor[actor.name] = {};

        for (const title of actor.movies) {
          try {
            // Fetch movie details from TMDB and OMDB
            const res = await axios.get('https://api.themoviedb.org/3/search/movie', {
              params: { api_key: TMDB_API_KEY, query: title }
            });
            const movie = res.data.results?.[0];
            if (!movie) continue;

            const details = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}`, {
              params: { api_key: TMDB_API_KEY, append_to_response: 'videos' }
            });
            const omdb = await axios.get('https://www.omdbapi.com/', { params: { apikey: OMDB_API_KEY, t: title } });

            // Parse ratings and runtime from OMDB
            const ratings = omdb.data.Ratings || [];
            const imdb = parseFloat(ratings.find(r => r.Source === 'Internet Movie Database')?.Value?.split('/')[0]) || 0;
            const rt = parseFloat(ratings.find(r => r.Source === 'Rotten Tomatoes')?.Value?.replace('%', '')) || 0;
            const meta = parseFloat(ratings.find(r => r.Source === 'Metacritic')?.Value?.split('/')[0]) || 0;
            const runtime = parseInt(omdb.data.Runtime?.replace(' min', '')) || 0;

            // Collect for aggregate stats
            imdbs.push(imdb);
            rts.push(rt);
            metas.push(meta);
            runtimes.push(runtime);

            // Store movie info grouped by actor
            dataByActor[actor.name][title] = {
              actor: actor.name,
              title,
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
              tmdbId: movie.id,
              overview: movie.overview || omdb.data.Plot,
              videoId: details.data.videos.results.find(v => v.site === 'YouTube')?.key || null,
              trivia: `Plot: ${omdb.data.Plot} | Runtime: ${omdb.data.Runtime} | Awards: ${omdb.data.Awards} | IMDb: ${imdb}/10 | RT: ${rt}% | Metacritic: ${meta}/100`,
              lat: 20 + Math.random() * 40,  // Dummy lat/lng for map markers
              lng: -90 + Math.random() * 180,
              vote_average: movie.vote_average || 0,
            };
          } catch {
            // Fail silently per movie
          }
        }

        // Calculate average stats for actor's movies
        stats[actor.name] = {
          name: actor.name,
          imdb: imdbs.reduce((a, b) => a + b, 0) / imdbs.length || 0,
          rt: rts.reduce((a, b) => a + b, 0) / rts.length || 0,
          meta: metas.reduce((a, b) => a + b, 0) / metas.length || 0,
          runtime: runtimes.reduce((a, b) => a + b, 0) / runtimes.length || 0
        };
      }

      // Set fetched data into state
      setMovieDataByActor(dataByActor);
      setChartData(Object.values(stats));
      setActorImages(images);
    };

    fetchData();
  }, []);

  /**
   * Toggles watched status for a movie title.
   *
   * @param {string} title - The movie title to toggle watched state for
   */
  const toggleWatched = (title) => {
    setWatchedMovies(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  /**
   * Toggles trivia dropdown visibility for a movie title.
   *
   * @param {string} title - The movie title to toggle trivia for
   */
  const toggleTrivia = (title) => {
    setShowTrivia(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  /**
   * Updates the user's rating for a given movie title.
   *
   * @param {string} title - The movie title to rate
   * @param {number} rating - The rating given by the user (1-5)
   */
  const handleUserRatingChange = (title, rating) => {
    setUserRatings(prev => ({ ...prev, [title]: rating }));
  };

  /**
   * Renders the selected chart type with current dataset.
   *
   * @returns {JSX.Element} The chart component
   */
  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey={chartDataset} fill="#FFD700" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie data={chartData} dataKey={chartDataset} nameKey="name" cx="50%" cy="50%" outerRadius={150}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart outerRadius={150} data={chartData}>
          <PolarAngleAxis dataKey="name" stroke="#fff" />
          <PolarRadiusAxis stroke="#ccc" />
          <Radar dataKey={chartDataset} stroke="#FFD700" fill="#FFD700" fillOpacity={0.6} />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', position: 'relative', padding: '1rem 2rem' }}>

      {/* Home Button */}
      <a
        href="/"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          backgroundColor: '#FFD700',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          fontSize: '24px',
          textAlign: 'center',
          lineHeight: '48px',
          color: '#111',
          textDecoration: 'none',
          boxShadow: '0 0 10px #FFD700',
          zIndex: 9999,
          userSelect: 'none',
          cursor: 'pointer'
        }}
        aria-label="Go to homepage"
        title="Go to homepage"
      >
        🏠
      </a>

      {/* Intro Video and Header */}
      <div className="video-container">
        <video autoPlay muted loop playsInline>
          <source src="/assets/bond-intro.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <img src="/assets/007-logo.png" alt="007 Logo" style={{ height: '160px', marginBottom: '1rem', borderRadius: '12px' }} />
            <h1 style={{ fontSize: '2.5rem', color: '#FFD700', textShadow: '2px 2px 10px black', letterSpacing: '1px' }}>
              THE BOND COLLECTION
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="navbar" style={{ textAlign: 'left', marginBottom: '1rem' }}>
        <a href="#actors" style={{ marginRight: '1.5rem' }}>Actors</a>
        <a href="#charts" style={{ marginRight: '1.5rem' }}>MI6 Data Lab</a>
        <a href="#map">Mission Locations</a>
      </nav>

      {/* Actor Sections with Movies */}
      <div id="actors" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
        {bondActors.map(actor => (
          <div key={actor.name} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Actor Profile Picture */}
              <img
                src={actorImages[actor.name]}
                alt={actor.name}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #FFD700',
                  flexShrink: 0
                }}
              />
              {/* Actor Name and Bio */}
              <div>
                <h3 style={{ color: '#FFD700', marginBottom: '0.3rem' }}>{actor.name}</h3>
                <p style={{ maxWidth: '600px', fontStyle: 'italic', color: '#ccc' }}>{actor.bio}</p>
              </div>
            </div>

            {/* Movies Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              {actor.movies.map(title => {
                const movie = movieDataByActor[actor.name]?.[title];
                if (!movie) return null;
                const starsCount = Math.round((movie.vote_average || 0) / 2);
                const userRating = userRatings[title] || 0;

                const localTmdbRoute = `http://localhost:4321/tmdb/${movie.tmdbId || 550}`;

                return (
                  <div key={title} style={{ width: '200px', backgroundColor: '#222', padding: '1rem', borderRadius: '10px', position: 'relative' }}>
                    {/* Wrap poster and title in a link to your local TMDB page */}
                    <a
                      href={localTmdbRoute}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <img
                        src={movie.poster}
                        alt={title}
                        style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <h4 style={{ color: '#FFD700', marginTop: '0.5rem' }}>{title}</h4>
                    </a>

                    {/* Current rating stars (readonly) */}
                    <div style={{ marginBottom: '0.3rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < starsCount ? '#FFD700' : '#555', fontSize: '1.2rem', userSelect: 'none', marginRight: '2px' }}>
                          {i < starsCount ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    {/* User rating stars (clickable) */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      Your Rating:{' '}
                      {[...Array(5)].map((_, i) => {
                        const starNum = i + 1;
                        return (
                          <span
                            key={i}
                            onClick={() => handleUserRatingChange(title, starNum)}
                            style={{
                              cursor: 'pointer',
                              color: starNum <= userRating ? '#FFD700' : '#555',
                              marginRight: '4px',
                              userSelect: 'none',
                            }}
                            role="button"
                            aria-label={`Rate ${starNum} star${starNum > 1 ? 's' : ''}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleUserRatingChange(title, starNum);
                              }
                            }}
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>

                    {/* Watched toggle button */}
                    <button
                      onClick={() => toggleWatched(title)}
                      style={{
                        backgroundColor: watchedMovies[title] ? '#4CAF50' : '#FFD700',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 1rem',
                        color: watchedMovies[title] ? '#fff' : '#111',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        fontFamily: 'Bebas Neue, sans-serif',
                        letterSpacing: '1px',
                      }}
                      aria-pressed={watchedMovies[title] || false}
                    >
                      {watchedMovies[title] ? 'Watched ✓' : 'Mark as Watched'}
                    </button>

                    {/* Trivia toggle button */}
                    <button
                      onClick={() => toggleTrivia(title)}
                      style={{
                        backgroundColor: '#333',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.3rem 0.6rem',
                        color: '#FFD700',
                        cursor: 'pointer',
                        marginTop: '0.5rem',
                        fontSize: '0.9rem'
                      }}
                    >
                      {showTrivia[title] ? 'Hide Trivia' : 'Show Trivia'}
                    </button>

                    {/* Trivia (dropdown) */}
                    {showTrivia[title] && (
                      <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '0.5rem' }}>
                        {movie.trivia}
                      </p>
                    )}

                    {/* YouTube Trailer */}
                    {movie.videoId && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <iframe
                          width="100%"
                          height="120"
                          src={`https://www.youtube.com/embed/${movie.videoId}`}
                          title={`${title} Trailer`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: '8px' }}
                        ></iframe>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MI6 Data Lab Charts */}
      <div id="charts" style={{ padding: '2rem', backgroundColor: '#1a1a1a' }}>
        <h2 style={{ color: '#FFD700' }}>MI6 Data Lab</h2>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <select onChange={e => setChartType(e.target.value)} value={chartType}>
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
            <option value="radar">Radar</option>
          </select>
          <select onChange={e => setChartDataset(e.target.value)} value={chartDataset} style={{ marginLeft: '1rem' }}>
            <option value="imdb">IMDb</option>
            <option value="rt">Rotten Tomatoes</option>
            <option value="meta">Metacritic</option>
            <option value="runtime">Runtime</option>
          </select>
        </div>
        {renderChart()}
      </div>

      {/* Mission Locations Map */}
      <div id="map" style={{ padding: '2rem' }}>
        <h2 style={{ color: '#FFD700' }}>Mission Locations</h2>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px', width: '100%', borderRadius: '10px' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {Object.values(movieDataByActor)
            .flatMap(actorMovies => Object.values(actorMovies))
            .map((movie, i) => (
              <Marker key={i} position={[movie.lat, movie.lng]} icon={redIcon}>
                <Popup>
                  <strong>{movie.title}</strong><br />
                  <img src={movie.poster} alt={movie.title} width="100" style={{ borderRadius: '6px', marginTop: '6px' }} />
                </Popup>
              </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default BondCollection;
