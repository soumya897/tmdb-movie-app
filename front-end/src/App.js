import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/home/home";
import Movie from "./pages/movieDetail/movie.jsx";
import MovieList from "./components/movieList/movieList";
import Auth from "./pages/Auth/Auth.js";
import VerifyOtp from "./pages/Auth/VeryfyOtp.js";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth pages (no layout) */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Main layout pages */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movie/:id" element={<Movie />} />
          <Route path="movies/:type" element={<MovieList />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
