import React from 'react';
import './TitleBar.css';

const TitleBar = () => {
  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <button onClick={() => window.electronAPI.showMenu()}>Menu</button>
      </div>
      <div className="title-bar-center">
        <button>←</button>
        <button>→</button>
        <span>src/index.js</span>
      </div>
    </div>
  );
};

export default TitleBar;
