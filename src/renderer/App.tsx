import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '@/renderer/components/Sidebar';
import { GlobalFlagProvider } from '@/renderer/context/GlobalFlagContext';
import TitleBar from '@/renderer/components/TitleBar';
import Projects from '@/renderer/pages/Projects';
import Devices from '@/renderer/pages/Devices';
import ProjectDetail from '@/renderer/pages/ProjectDetail';
import UnitDetail from '@/renderer/pages/UnitDetail';
import '@/renderer/styles/App.css';
import Flowchart from '@/renderer/flowchart/pages/Flowchart';

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
