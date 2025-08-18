// src/components/GenreMoviesWrapper.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import GenreMovies from './GenreMovies';

// Extracts :id from URL and passes it to GenreMovies component
const GenreMoviesWrapper = () => {
  const { id } = useParams();
  return <GenreMovies id={id} />;
};

export default GenreMoviesWrapper;