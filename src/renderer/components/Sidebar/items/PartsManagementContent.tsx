import React from 'react';
import { Link } from 'react-router-dom';
import '@/renderer/styles/Common.css';

const PartsManagementContent = () => {
  return (
    <div className="List">
      <ul className="ListItems">
        <li>
          <Link to="/parts" className="list-row">
            <span className="icon">📋</span>
            <span className="list-column">駆動部品一覧</span>
          </Link>
        </li>
        <li>
          <Link to="/manufacturers" className="list-row">
            <span className="icon">🏭</span>
            <span className="list-column">メーカー一覧</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default PartsManagementContent;
