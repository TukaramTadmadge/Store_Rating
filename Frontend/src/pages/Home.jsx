// src/pages/Homepage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/images/Home.jpg'; // Importing image
import './Home.css';

const Homepage = () => (
  <div
    className="home-container"
    style={{
      background: `
        linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)),
        url(${bgImage}) center/cover no-repeat
      `
    }}
  >
    <h1>Welcome to StoreRating Platform</h1>
    <p>
      Rate your favorite stores, manage your own store, or administrate the platform — all in one place.
    </p>
    <div className="btn-group">
      <Link to="/signup" className="btn btn-primary">Sign Up</Link>
      <Link to="/login" className="btn btn-secondary">Login</Link>
    </div>
  </div>
);

export default Homepage;
