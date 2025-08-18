import React, { useState, useEffect } from 'react';

// news api key
const NEWS_KEY = "ee356e3d2dae4ae3acfc458831766716";

export default function OscarNews({ query }) {
  // news articles list
  const [articles, setArticles] = useState([]);
  // fetch error
  const [error, setError] = useState(null);
  
  // load news on query change
  useEffect(() => {
    // ensure api key exists
    if (!NEWS_KEY) {
      console.error("Missing News API key");
      setError(new Error("Missing key"));
      return;
    }
    // fetch articles for query
    fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${NEWS_KEY}`
    )
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(json => setArticles(json.articles || []))
      .catch(err => {
        console.error(err);
        setError(err);
      });
  }, [query]);
  // show error message
  if (error) return <p>Failed to load news.</p>;
  // no articles found
  if (!articles.length) return <p>No news found.</p>;
  // render news grid
  return (
    <div className="oscar-news">
      <h2>Related News</h2>
      <div className="news-grid">
        {articles.map(a => (
          <article key={a.url} className="news-card">
           {/* article image */}
            {a.urlToImage && (
              <img
                src={a.urlToImage}
                alt={a.title}
                className="news-card-img"
              />
            )}
            {/* body with title and description */}
            <div className="news-card-body">
              <h3 className="news-card-title">
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  {a.title}
                </a>
              </h3>
              <p className="news-card-meta">
                {a.source.name} &mdash; {new Date(a.publishedAt).toLocaleDateString()}
              </p>
              <p className="news-card-desc">{a.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}