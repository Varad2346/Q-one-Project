import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import Services from './Services';
import Faq from './Faq';
import Client from './Client';
import "./styles/Home.css";

const Home = () => {
  // State to track whether to show the scroll-to-top button
  const [showScroll, setShowScroll] = useState(false);

  // Track scroll position and show the scroll button when scrolled down
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScroll(true); // Show the button if scrolled down 300px
    } else {
      setShowScroll(false); // Hide the button if near top
    }
  };

  // Scroll to the top of the page when the button is clicked
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Attach scroll event listener when component mounts
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="main-container">
      <HeroSection />
      <Services />
      <Client />
      <Faq />

      {/* Scroll to top button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top"
          aria-label="Scroll to top"
        >
          <span>^</span> {/* Simple up arrow */}
        </button>
      )}
    </section>
  );
};

export default Home;
