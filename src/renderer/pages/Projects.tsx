import { useState, useEffect } from 'react';
import DatabaseFactory from '../utils/DatabaseFactory';
import './Projects.css';
import { useGlobalFlag } from '../context/GlobalFlagContext';
import '../styles/Common.css'; // 共通スタイルをインポート
import ListComponent from '../components/common/ListComponent';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function Projects() {
  const [projects, setProjects] = useState<
    { id: number; name: string; updatedAt: string }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setSidebarVisibility } = useGlobalFlag();

  useEffect(() => {
    setSidebarVisibility(false); // Sidebar を非表示に設定
    const fetchProjects = async () => {
      const data = await ProjectsDB.getAllProjects();
      setProjects(data);
    };
    fetchProjects();
    return () => {
      setSidebarVisibility(true); // クリーンアップ時に Sidebar を再表示
    };
  }, [setSidebarVisibility]);

  const handleAddProject = () => {
    // モーダルを表示する
    setIsModalOpen(true);
  };

  return (
    <>
      <ListComponent
        title="プロジェクト一覧"
        onAddNew={handleAddProject}
        headers={[{ label: '名前' }, { label: '更新日時' }]}
        items={projects.map((project) => ({
          id: project.id,
          to: `/projects/${project.id}`,
          columns: [{ content: project.name }, { content: project.updatedAt }],
        }))}
        addButtonLabel="新規作成"
      />

      {/* モーダルは他のコンポーネントで実装する必要がある */}
      {isModalOpen && (
        <div>
          {/* モーダル内容 */}
          <button onClick={() => setIsModalOpen(false)}>閉じる</button>
        </div>
      )}
    </>
  );
}
