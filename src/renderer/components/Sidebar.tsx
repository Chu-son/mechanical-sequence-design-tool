import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`Sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="Hamburger">
        ☰
      </button>
      <nav>
        <ul>
          <li>
            <Link to="/">プロジェクト</Link>
          </li>
          <li>
            <Link to="/devices">デバイスリスト</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
