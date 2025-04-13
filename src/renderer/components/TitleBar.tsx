import React, { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '@/renderer/components/TitleBar.css';

function TitleBar(): JSX.Element {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  };

  const navigateForward = () => {
    navigate(1);
  };

  const location = useLocation();

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <button type="button" onClick={() => window.electronAPI.showMenu()}>
          Menu
        </button>
      </div>
      <div className="title-bar-center">
        <button type="button" onClick={() => navigate('/')}>
          <span role="img" aria-label="home">
            🏠
          </span>
        </button>
        <button type="button" onClick={navigateBack}>
          ←
        </button>
        <button type="button" onClick={navigateForward}>
          →
        </button>
        <span className="location-path">{location.pathname}</span>
      </div>
      <div className="title-bar-right" />
    </div>
  );
}

export default TitleBar;
