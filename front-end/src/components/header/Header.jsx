import React, { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { IoMdMenu, IoMdClose } from "react-icons/io"; // For mobile menu icons


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="headerLeft">
        <Link to="/" onClick={closeMenu}>
          <img
            className="header__icon"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/2560px-IMDB_Logo_2016.svg.png"
            alt="IMDb"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="navLinks desktop">
          <Link to="/movies/popular" onClick={closeMenu}><span>Popular</span></Link>
          <Link to="/movies/top_rated" onClick={closeMenu}><span>Top Rated</span></Link>
          <Link to="/movies/upcoming" onClick={closeMenu}><span>Upcoming</span></Link>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="menuToggle" onClick={toggleMenu}>
          {menuOpen ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="navLinks mobile">
          <Link to="/movies/popular" onClick={closeMenu}><span>Popular</span></Link>
          <Link to="/movies/top_rated" onClick={closeMenu}><span>Top Rated</span></Link>
          <Link to="/movies/upcoming" onClick={closeMenu}><span>Upcoming</span></Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
