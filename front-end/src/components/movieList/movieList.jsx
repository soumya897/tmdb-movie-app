import React, { useEffect, useState } from "react"
import "./movieList.css"
import { useParams, Link } from "react-router-dom"
import Cards from "../card/card"

const MovieList = () => {
  const [movieList, setMovieList] = useState([])
  const { type } = useParams()

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${type || "popular"}?api_key=6e5c5ee5feedc953d504088b213370e5&language=en-US`
        )
        const data = await response.json()
        setMovieList(data.results)
        console.log("Fetched Movies:", data.results);

        
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      }
    }

    getData()
  }, [type])

  return (
    <div className="movie__list">
      <div className="movie-row-header">
        <h2 className="list__title">{(type || "Popular").toUpperCase()}</h2>

        {/* Hide Show More button if we're already in the detailed page */}
        {!type && (
          <Link className="movie-row-showmore" to="/movies/popular">
            Show More
          </Link>
        )}
      </div>

      <div className="list__cards">
        {movieList.map((movie) => (
          <Cards key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

export default MovieList
