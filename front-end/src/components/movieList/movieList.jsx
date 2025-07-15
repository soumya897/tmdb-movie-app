import React, { useEffect, useState } from "react";
import "./movieList.css";
import { useParams, Link } from "react-router-dom";
import Cards from "../card/card";

const MovieList = () => {
  const [movieList, setMovieList] = useState([]);
  const { type } = useParams();
    const apikey=import.meta.env.VITE_API_KEY;


  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${type || "popular"}?api_key=${apikey}&language=en-US`
        );
        const data = await response.json();
        setMovieList(data.results);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };

    getData();
  }, [type]);

  return (
    <div className="movie__list">
      <div className="movie-row-header">
        <h2 className="list__title">{(type || "Popular").toUpperCase()}</h2>
        {!type && (
          <Link className="movie-row-showmore" to="/movies/popular">
            Show More
          </Link>
        )}
      </div>

      <div className="list__cards">
        {movieList
          .filter((movie) => movie.poster_path || movie.backdrop_path)
          .map((movie) => (
            <Cards key={movie.id} movie={movie} />
          ))}
      </div>
    </div>
  );
};

export default MovieList;