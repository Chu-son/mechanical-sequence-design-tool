import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import ListComponent from '@/renderer/features/common/ListComponent';
import FormModal from '@/renderer/features/common/FormModal';
import { useFormModal } from '@/renderer/hooks/useModal';
import { projectModalConfig } from '@/renderer/config/modalConfigs';
import '@/renderer/styles/Common.css';
import '@/renderer/styles/Modal.css';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function Projects() {
  const [projects, setProjects] = useState<
    {
      id: number;
      name: string;
      description?: string;
      updatedAt: string;
      createdAt: string;
    }[]
  >([]);

  // プロジェクト作成モーダルのための状態管理
  const projectModal = useFormModal<{ name: string; description?: string }>(
    async (data) => {
      // プロジェクトの保存処理
      await ProjectsDB.createProject({
        name: data.name,
        description: data.description,
      });
      // データを再取得
      fetchProjects();
    },
  );

  const fetchProjects = async () => {
    const data = await ProjectsDB.getAllProjects();
    setProjects(data);
  };

  useEffect(() => {
    // サイドバーの非表示設定を削除し、常に表示されるようにする
    fetchProjects();
  }, []);

  return (
    <>
      <ListComponent
        title="プロジェクト一覧"
        onAddNew={projectModal.open}
        headers={[
          { label: '名前' },
          { label: '説明' },
          { label: '作成日' },
          { label: '更新日時' },
        ]}
        items={projects.map((project) => ({
          id: project.id,
          to: `/projects/${project.id}`,
          columns: [
            { content: project.name },
            { content: project.description || '-' },
            {
              content: new Date(project.createdAt).toLocaleDateString('ja-JP'),
            },
            {
              content: new Date(project.updatedAt).toLocaleDateString('ja-JP'),
            },
          ],
        }))}
        addButtonLabel="新規作成"
        menuItems={[
          {
            label: '削除',
            onClick: () => {},
            className: 'delete',
          },
        ]}
        menuColumnWidth="48px"
      />

      {/* プロジェクト作成モーダル */}
      <FormModal
        isOpen={projectModal.isOpen}
        onClose={projectModal.close}
        onSave={projectModal.saveAndClose}
        {...projectModalConfig}
      />
    </>
  );
}
