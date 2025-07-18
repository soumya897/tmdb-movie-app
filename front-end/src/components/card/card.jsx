import React, { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./card.css";
import { Link } from "react-router-dom";
import noPoster from "../../assets/noPoster.jpg"; // ✅ better fallback than gif

const Cards = ({ movie }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const posterURL = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : noPoster;

  return (
    <>
      {isLoading ? (
        <div className="cards">
          <SkeletonTheme color="#202020" highlightColor="#444">
            <Skeleton height={300} duration={2} />
          </SkeletonTheme>
        </div>
      ) : (
        <Link to={`/movie/${movie.id}`} style={{ textDecoration: "none", color: "white" }}>
          <div className="cards">
            <img
              className="cards__img"
              src={posterURL}
              alt={movie?.original_title || "No Title"}
              loading="lazy"
            />
            <div className="cards__overlay">
              <div className="card__title">{movie?.original_title}</div>
              <div className="card__runtime">
                {movie?.release_date}
                <span className="card__rating">
                  {movie?.vote_average}
                  <i className="fas fa-star" />
                </span>
              </div>
              <div className="card__description">
                {movie?.overview ? movie.overview.slice(0, 118) + "..." : "No description available"}
              </div>
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default Cards;