// src/components/HeroSection.jsx
import React from 'react';
import { DROPDOWN_OPTIONS } from '../../constants/constant';
import { useNavigate } from 'react-router-dom'; // for navigation
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
        {DROPDOWN_OPTIONS.map((option, index) => (
          <div 
            key={index} 
            className='card'
            onClick={() => handleCardClick(option.path)} // Make entire card clickable
          >
            {option.icon && <div className='card-icon'>{option.icon}</div>}
            <h2 className='card-title'>{option.label}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
