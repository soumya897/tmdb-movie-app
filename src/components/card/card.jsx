import React, { useEffect, useState } from "react"
import Skeleton, { SkeletonTheme } from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import "./card.css"
import { Link } from "react-router-dom"

const Cards = ({ movie }) => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            {isLoading ? (
                <div className="cards">
                    <SkeletonTheme color="#202020" highlightColor="#444">
                        <Skeleton height={300} />
                    </SkeletonTheme>
                </div>
            ) : (
                <Link
                    to={`/movie/${movie.id}`}
                    style={{ textDecoration: "none", color: "white" }}
                >
                    <div className="cards">
                        <img
                            className="cards__img"
                            src={
                                movie.poster_path
                                    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Image"
                            }
                            alt={movie.original_title}
                        />
                        <div className="cards__overlay">
                            <div className="card__title">{movie.original_title}</div>
                            <div className="card__runtime">
                                {movie.release_date}
                                <span className="card__rating">
                                    {movie.vote_average}
                                    <i className="fas fa-star" />
                                </span>
                            </div>
                            <div className="card__description">
                                {movie.overview
                                    ? movie.overview.slice(0, 118) + "..."
                                    : "No description available."}
                            </div>
                        </div>
                    </div>
                </Link>
            )}
        </>
    )
}

export default Cards
