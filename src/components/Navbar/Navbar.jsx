import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { NAVBAR_LINKS, LOGO_SRC } from "../../constants/constant"; 
import { useAuth } from '../../store/auth';
import "./Navbar.css";

const Navbar = () => {
  const [navbarActive, setNavbarActive] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {isLoggedIn,logout}=useAuth();

  const toggleNavbar = () => {
    setNavbarActive(prevState => !prevState);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleScrollToSection = (scrollTo) => {
    const element = document.getElementById(scrollTo);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={`navbar ${navbarActive ? "active" : ""}`}>
      <NavLink to="/" className="navbar-logo">
        <img className="navbar-logo-img" src={LOGO_SRC} alt="web-logo" />
      </NavLink>
      
      <div className="hamburger" onClick={toggleNavbar}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className={`navbar-links ${navbarActive ? "active" : ""}`}>
        {location.pathname === "/home" ? (
          NAVBAR_LINKS.map(link => (
            <div
              key={link.label}
              className="navbar-link"
              onClick={() => link.scrollTo ? handleScrollToSection(link.scrollTo) : navigate(link.path)}
            >
              {link.label}
            </div>
          ))
        ) : (
          <NavLink to="/home" className="navbar-link">
            Home
          </NavLink>
        )}

        {/* Logout Button */}
        <div className="navbar-link" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>
      </div>
    </div>
  );
};

export default Navbar;
