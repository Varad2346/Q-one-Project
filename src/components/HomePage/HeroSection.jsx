// src/components/HeroSection.jsx
import React from 'react';
import { DROPDOWN_OPTIONS } from '../../constants/constant';
import { useNavigate,NavLink } from 'react-router-dom'; // for navigation
import './styles/HeroSection.css';
import "./styles/responsive.css";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path); // Navigate to path when card is clicked
  };

  return (
    <div className='hero'>
      <div className='overlay'></div>
      <div className='card-container'>
        {/* {
           <NavLink to="/admin" className="navbar-link">
           Dashboard
         </NavLink>
        } */}
      {DROPDOWN_OPTIONS.map(({ icon, label, path }, index) => (
  <div 
    key={index} 
    className='card'
    onClick={() => handleCardClick(path)} 
  >
    {icon && <div className='card-icon'>{icon}</div>}
    <h2 className='card-title'>
      {label === 'Add New Role' ? (
        <>
          Add New<br />Role
        </>
      ) : label === 'Training Calendar' ? (
        <>
          Training<br />Calendar
        </>
      ) : (
        label
      )}
    </h2>
  </div>
))}

      </div>
    </div>
  );
};

export default HeroSection;
