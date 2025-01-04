import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { NAVBAR_LINKS, LOGO_SRC } from "../../constants/constant";
import { useAuth } from '../../store/auth';
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";

const Navbar = () => {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false); // State for profile card visibility
  const [navbarActive, setNavbarActive] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredUser, setFilteredUser] = useState(null);

  const { isLoggedIn, logout, authToken } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        fetchUserData(token, decoded.id);
      } catch (error) {
        console.error("Error decoding the token:", error);
      }
    }
  }, [isLoggedIn]);

  const fetchUserData = async (token, decodedUserId) => {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.success) {
      const filteredUser = data.data.find(user => user.userId === decodedUserId);
      setFilteredUser(filteredUser);
    }
  };

  const toggleNavbar = () => {
    // setNavbarActive(prevState => !prevState);
  };

  const handleLogout = () => {
    setIsProfileCardOpen(false);
    logout();
    navigate("/");
  };

  const handleScrollToSection = (scrollTo) => {
    const element = document.getElementById(scrollTo);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleProfileClick = () => {
    setIsProfileCardOpen((prevState) => !prevState); // Toggle profile card visibility
  };

  // Logic for hovering over profile icon or profile card
  const handleProfileIconHover = () => {
    setIsProfileCardOpen(true); // Show the profile card when hovering over the profile icon
  };

  const handleProfileCardHover = () => {
    setIsProfileCardOpen(true); // Keep the profile card visible when hovering over the card itself
  };

  const handleProfileIconLeave = () => {
    // Hide the profile card when leaving the profile icon, but only if not hovering over the card
    if (!isProfileCardOpen) {
      setIsProfileCardOpen(false);
    }
  };

  const handleProfileCardLeave = () => {
    // Hide the profile card when leaving the profile card itself
    setIsProfileCardOpen(false);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
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

        {/* User Icon (opens profile card) */}
        <div
          className="navbar-link1"
          onClick={handleProfileIconHover} // Detect mouse hover on profile icon
          onMouseLeave={handleProfileIconLeave} // Detect when mouse leaves profile icon
        >
          <img
            className="user-image"
            src="https://files.codingninjas.in/avatar-1710924338.png"
            alt=""
          />
        </div>
      </div>
      
      {/* Profile Card */}
      
    </div>
    <div
    className={`profile-card ${isProfileCardOpen ? "open" : ""}`}
    onClick={handleProfileCardHover} // Keep the card open when hovering over it
    onMouseLeave={handleProfileCardLeave} // Hide the card when mouse leaves it
  >
    <div className="one">
      <img
        className="user-image1"
        src="https://files.codingninjas.in/avatar-1710924338.png"
        alt=""
      />
      <span className="name">{filteredUser ? filteredUser.firstName + " " + filteredUser.lastName : "NA"}</span>
    </div>
    <div className="two">
      <div className="log-button" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </div>
      <div className="designation">{filteredUser ? filteredUser.role : "NA"}</div>
    </div>
  </div>
  </>
  );
};

export default Navbar;
