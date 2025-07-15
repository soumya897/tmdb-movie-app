import React, { useEffect, useState } from "react"
import "./movie.css"
import { useParams } from "react-router-dom"

const Movie = () => {
    const [currentMovieDetail, setMovie] = useState(null)
    const { id } = useParams()
  const API_KEY= import.meta.env.VITE_API_KEY;

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
                )
                const data = await res.json()
                setMovie(data)
                window.scrollTo(0, 0)
            } catch (err) {
                console.error("Failed to fetch movie details:", err)
            }
        }

        getData()
    }, [id])

    return (
        <div className="movie">
            {/* Backdrop */}
            <div className="movie__intro">
                <img
                    className="movie__backdrop"
                    src={
                        currentMovieDetail?.backdrop_path
                            ? `https://image.tmdb.org/t/p/original${currentMovieDetail.backdrop_path}`
                            : "https://via.placeholder.com/1280x720?text=No+Image"
                    }
                    alt="Movie Backdrop"
                />
            </div>

            {/* Main Details */}
            <div className="movie__detail">
                <div className="movie__detailLeft">
                    <div className="movie__posterBox">
                        <img
                            className="movie__poster"
                            src={
                                currentMovieDetail?.poster_path
                                    ? `https://image.tmdb.org/t/p/original${currentMovieDetail.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Poster"
                            }
                            alt="Movie Poster"
                        />
                    </div>
                </div>

                <div className="movie__detailRight">
                    <div className="movie__detailRightTop">
                        <div className="movie__name">
                            {currentMovieDetail?.original_title}
                        </div>
                        <div className="movie__tagline">
                            {currentMovieDetail?.tagline}
                        </div>
                        <div className="movie__rating">
                            {currentMovieDetail?.vote_average}{" "}
                            <i className="fas fa-star" />
                            <span className="movie__voteCount">
                                {` (${currentMovieDetail?.vote_count} votes)`}
                            </span>
                        </div>
                        <div className="movie__runtime">
                            {currentMovieDetail?.runtime} mins
                        </div>
                        <div className="movie__releaseDate">
                            Release date: {currentMovieDetail?.release_date}
                        </div>

                        {/* Genres */}
                        <div className="movie__genres">
                            {currentMovieDetail?.genres?.map((genre) => (
                                <span
                                    className="movie__genre"
                                    key={genre.id}
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="movie__detailRightBottom">
                        <div className="synopsisText">Synopsis</div>
                        <div>{currentMovieDetail?.overview}</div>
                    </div>
                </div>
            </div>

            {/* External Links */}
            <div className="movie__links">
                <div className="movie__heading">Useful Links</div>
                {currentMovieDetail?.homepage && (
                    <a
                        href={currentMovieDetail.homepage}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                    >
                        <p>
                            <span className="movie__homeButton movie__Button">
                                Homepage{" "}
                                <i className="newTab fas fa-external-link-alt" />
                            </span>
                        </p>
                    </a>
                )}
                {currentMovieDetail?.imdb_id && (
                    <a
                        href={`https://www.imdb.com/title/${currentMovieDetail.imdb_id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                    >
                        <p>
                            <span className="movie__imdbButton movie__Button">
                                IMDb{" "}
                                <i className="newTab fas fa-external-link-alt" />
                            </span>
                        </p>
                    </a>
                )}
            </div>

            {/* Production Companies */}
            <div className="movie__heading">Production companies</div>
            <div className="movie__production">
                {currentMovieDetail?.production_companies?.map((company) =>
                    company.logo_path ? (
                        <span
                            className="productionCompanyImage"
                            key={company.id}
                        >
                            <img
                                className="movie__productionComapany"
                                src={`https://image.tmdb.org/t/p/original${company.logo_path}`}
                                alt={company.name}
                            />
                            <span>{company.name}</span>
                        </span>
                    ) : null
                )}
            </div>
        </div>
    )
}

export default Movie
