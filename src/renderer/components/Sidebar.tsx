import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalFlag } from '../context/GlobalFlagContext';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // デフォルトで閉じた状態に設定

  const { isSidebarVisible } = useGlobalFlag();

  if (!isSidebarVisible) {
    return null; // フラグが false の場合はレンダリングしない
  }

  return (
    <div className={`Sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="Hamburger"
        type="button"
      >
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
