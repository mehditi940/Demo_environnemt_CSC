import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <h1>404</h1>
        </div>
        <h2>Pagina niet gevonden</h2>
        <p>De pagina die je zoekt bestaat niet of is verplaatst.</p>
        <div className="not-found-actions">
          <button onClick={handleGoBack} className="btn-secondary">
            Ga terug
          </button>
          <button onClick={handleGoHome} className="btn-primary">
            Naar home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
