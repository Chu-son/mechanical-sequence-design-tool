import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '@/renderer/features/sidebar/components/Sidebar';
import { GlobalFlagProvider } from '@/renderer/context/GlobalFlagContext';
import { DnDProvider } from '@/renderer/features/flowchart/utils/DnDContext';
import TitleBar from '@/renderer/components/TitleBar';
import Projects from '@/renderer/pages/Projects';
import Devices from '@/renderer/pages/Devices';
import ProjectDetail from '@/renderer/pages/ProjectDetail';
import UnitDetail from '@/renderer/pages/UnitDetail';
import PartsList from '@/renderer/pages/PartsList';
import ManufacturerList from '@/renderer/pages/ManufacturerList';
import '@/renderer/styles/App.css';
import Flowchart from '@/renderer/features/flowchart/pages/Flowchart';
import VTCurveEditPage from '@/renderer/pages/VTCurveEditPage';

// サイドバーの状態に応じてコンテンツのクラスを設定するためのラッパーコンポーネント
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  // サイドバーの状態変更をリッスン
  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      setSidebarOpen(isOpen);

      // ピン留め状態の変化をリッスンするカスタムイベントも追加できます
      if (event.detail.isPinned !== undefined) {
        setSidebarPinned(event.detail.isPinned);
      }
    };

    // カスタムイベントをリッスン
    window.addEventListener('sidebar-change' as any, handleSidebarChange);

    return () => {
      window.removeEventListener('sidebar-change' as any, handleSidebarChange);
    };
  }, []);

  // サイドバーの状態に基づいてクラス名を生成
  const getContentClassNames = () => {
    const classes = ['Content'];

    if (sidebarOpen || sidebarPinned) {
      classes.push('sidebar-open');
    }

    if (sidebarPinned) {
      classes.push('sidebar-pinned');
    }

    return classes.join(' ');
  };

  return (
    <div className="App">
      <Sidebar />
      <div className={getContentClassNames()}>
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

          {/* 駆動部品管理ページのルート */}
          <Route path="/parts" element={<PartsList />} />
          <Route path="/manufacturers" element={<ManufacturerList />} />
          <Route path="/vtcurve-edit/:partId" element={<VTCurveEditPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GlobalFlagProvider>
      <DnDProvider>
        <Router>
          <header>
            <TitleBar />
          </header>
          <AppContent />
        </Router>
      </DnDProvider>
    </GlobalFlagProvider>
  );
}
