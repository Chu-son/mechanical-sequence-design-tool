import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { GlobalFlagProvider } from './context/GlobalFlagContext';
import TitleBar from './components/TitleBar';
import Projects from './pages/Projects';
import Devices from './pages/Devices';
import ProjectDetail from './pages/ProjectDetail';
import UnitDetail from './pages/UnitDetail';
import './styles/App.css';
import Flowchart from './flowchart/pages/Flowchart';

export default function App() {
  return (
    <GlobalFlagProvider>
      <Router>
        <header>
          <TitleBar />
        </header>
        <div className="App">
          <Sidebar />
          <div className="Content">
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route
                path="/projects/:projectId/unit/:unitId"
                element={<UnitDetail />}
              />
              <Route
                path="/projects/:projectId/unit/:unitId/flowchart/:configType/:configId"
                element={<Flowchart />}
              />
              <Route path="/devices" element={<Devices />} />
            </Routes>
          </div>
        </div>
      </Router>
    </GlobalFlagProvider>
  );
}
