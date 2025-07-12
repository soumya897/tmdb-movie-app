import React, { useEffect, useState } from "react"
import "./home.css"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Carousel } from "react-responsive-carousel"
import { Link } from "react-router-dom"
import Cards from "../../components/card/card"

const categories = [
  { title: "Popular", path: "popular" },
  { title: "Top Rated", path: "top_rated" },
  { title: "Upcoming", path: "upcoming" }
]

const Home = () => {
  const [movies, setMovies] = useState({})
  const [carouselMovies, setCarouselMovies] = useState([])

  useEffect(() => {
    // Fetch rows for each category
    categories.forEach(async ({ path }) => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${path}?api_key=API_KEY&language=en-US`
        )
        const data = await res.json()
        setMovies((prev) => ({ ...prev, [path]: data.results }))
      } catch (err) {
        console.error(`Error fetching ${path}:`, err)
      }
    })

    // Fetch movies for carousel
    const fetchCarousel = async () => {
      try {
        const res = await fetch(
          "https://api.themoviedb.org/3/movie/popular?api_key=API_KEY&language=en-US"
        )
        const data = await res.json()
        setCarouselMovies(data.results)
      } catch (err) {
        console.error("Error fetching carousel movies:", err)
      }
    }

    fetchCarousel()
  }, [])

  return (
    <div className="poster">
      {/* Hero Carousel */}
      <Carousel
        showThumbs={false}
        autoPlay
        transitionTime={3}
        infiniteLoop
        showStatus={false}
      >
        {carouselMovies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            style={{ textDecoration: "none", color: "white" }}
          >
            <div className="posterImage">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.original_title}
              />
            </div>
            <div className="posterImage__overlay">
              <div className="posterImage__title">{movie.original_title}</div>
              <div className="posterImage__runtime">
                {movie.release_date}
                <span className="posterImage__rating">
                  {movie.vote_average}
                  <i className="fas fa-star" />
                </span>
              </div>
              <div className="posterImage__description">{movie.overview}</div>
            </div>
          </Link>
        ))}
      </Carousel>

      {/* Movie Rows */}
      {categories.map(({ title, path }) => (
        <div key={path} className="movie-row-section">
          <div className="movie-row-header">
            <h2 className="movie-row-title">{title}</h2>
            <Link to={`/movies/${path}`} className="movie-row-showmore">Show More</Link>
          </div>
          <div className="movie-row">
            {movies[path]?.slice(0, 10).map((movie) => (
              <Cards key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home
