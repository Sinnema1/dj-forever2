import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

/**
 * NotFoundPage - 404 error page
 *
 * Displayed when users navigate to a non-existent route.
 * Provides helpful navigation back to the homepage.
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/" className="not-found-home-button">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
