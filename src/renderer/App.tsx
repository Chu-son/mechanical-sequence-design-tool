import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Projects from './pages/Projects';
import Devices from './pages/Devices';
import ProjectDetail from './pages/ProjectDetail';
import UnitDetail from './pages/UnitDetail';
import './styles/App.css';
import Flowchart from './pages/Flowchart';

export default function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="Content">
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/" element={<Projects />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/unit/:unitId" element={<UnitDetail />} />
            <Route path="/flowchart" element={<Flowchart />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
