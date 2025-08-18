import React, { useState, useEffect } from 'react';
// youtube api key
const YT_KEY = "AIzaSyBslOuNXWzU5UY2HyGhF5sbDWHc3HNeVCc";

export default function OscarVideo({ query }) {
  // video ids array
  const [videoIds, setVideoIds] = useState([]);
  const [error, setError] = useState(null);
  // debugging
  console.log("YouTube query:", query); 


  useEffect(() => {
    // ensure key exists
    if (!YT_KEY) {
      console.error("Missing YouTube API key");
      setError(new Error("Missing key"));
      return;
    }
    // search youtube for query
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${YT_KEY}`
    )
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      // extract video ids from response
      .then(json => setVideoIds(json.items?.map(i => i.id.videoId) || []))
      .catch(err => {
        console.error(err);
        setError(err);
      });
  }, [query]);
  // display error message
  if (error) return <p>Failed to load videos.</p>;
  // no videos found
  if (!videoIds.length) return <p>No videos found.</p>;
  // render video grid
  return (
    <div className="oscar-videos">
      <h2>Related Videos</h2>
      <div className="videos-grid">
        {videoIds.map(id => (
          <div key={id} className="video-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </div>
  );
}