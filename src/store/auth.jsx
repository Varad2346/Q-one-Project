import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext();

// AuthProvider component to provide authentication context
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    // If a token is found, check if it is expired
    if (storedToken && !isTokenExpired(storedToken)) {
      setAuthToken(storedToken); 
      setIsLoggedIn(true); 
    } else {
      // If token is expired or not found, log out
      setIsLoggedIn(false);
      setAuthToken(null);
      localStorage.removeItem('token');
    }
  }, []);
  

  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
      return payload;
    } catch (error) {
      console.error("Error decoding token", error);
      return null;
    }
  };
  
  const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      return decoded.exp < currentTime;
    }
    return false;
  };
  



  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the token in localStorage
        setAuthToken(data.token); // Set token in state
        setIsLoggedIn(true); // Update the login state
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Propagate the error to the caller
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setAuthToken(null); // Clear the token from state
    setIsLoggedIn(false); // Update the login state
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};
