import React, { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import './TitleBar.css';

function TitleBar(): JSX.Element {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  };

  const navigateForward = () => {
    navigate(1);
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <button type="button" onClick={() => window.electronAPI.showMenu()}>
          Menu
        </button>
      </div>
      <div className="title-bar-center">
        <button type="button" onClick={navigateBack}>
          ←
        </button>
        <button type="button" onClick={navigateForward}>
          →
        </button>
        <span>home</span>
      </div>
    </div>
  );
}

export default TitleBar;
