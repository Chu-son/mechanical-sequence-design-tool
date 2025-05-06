import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { useFormModal } from '@/renderer/hooks/useModal';
import FormModal from '@/renderer/components/common/FormModal';
import ListComponent from '@/renderer/components/common/ListComponent';
import { unitModalConfig } from '@/renderer/config/modalConfigs';
import '@/renderer/styles/Common.css';
import '@/renderer/styles/Modal.css';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const stateProjectId = location.state?.projectId || projectId;
  const [project, setProject] = useState<{
    id: number;
    name: string;
    description?: string;
    units: {
      id: number;
      name: string;
      description?: string;
      parentId: number | null;
      createdAt: string;
      updatedAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
  } | null>(null);

  // ユニット作成モーダルのための状態管理
  const unitModal = useFormModal<{ name: string; description?: string }>(
    async (data) => {
      // ユニットの保存処理
      await ProjectsDB.createUnit({
        projectId: Number(projectId),
        name: data.name,
        description: data.description,
        parentId: null,
      });
      // データを再取得
      fetchProject();
    },
  );

  const fetchProject = async () => {
    const data = await ProjectsDB.getProjectById({
      projectId: Number(projectId),
    });

    if (data) {
      // プロジェクトデータをセットする前に、units配列を確実にトップレベルのみにフィルタリング
      const topLevelUnits = data.units.filter((unit) => unit.parentId === null);
      setProject({
        ...data,
        units: topLevelUnits, // トップレベルユニットのみをセット
      });
    } else {
      setProject(null);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // 念のためこの関数も維持（他の場所で使われる可能性があるため）
  const getTopLevelUnits = (
    units: { id: number; name: string; parentId: number | null }[],
  ) => {
    return units.filter((unit) => unit.parentId === null);
  };

  if (!project) return <div>Loading...</div>;

  // ここではすでにフィルタリング済みのunitsを使用
  const topLevelUnits = project.units;

  return (
    <>
      <div className="project-header">
        <h1>{project.name}</h1>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
        <div className="project-meta">
          <span>
            作成日: {new Date(project.createdAt).toLocaleDateString('ja-JP')}
          </span>
          <span>
            更新日: {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
      </div>

      <ListComponent
        title="ユニット一覧"
        onAddNew={unitModal.open}
        headers={[
          { label: '名前' },
          { label: '説明' },
          { label: '作成日' },
          { label: '更新日時' },
        ]}
        items={topLevelUnits.map((unit) => ({
          id: unit.id,
          to: `/projects/${stateProjectId}/unit/${unit.id}`,
          columns: [
            { content: unit.name },
            { content: unit.description || '-' },
            { content: new Date(unit.createdAt).toLocaleDateString('ja-JP') },
            { content: new Date(unit.updatedAt).toLocaleDateString('ja-JP') },
          ],
        }))}
        addButtonLabel="新規作成"
      />

      {/* ユニット作成モーダル */}
      <FormModal
        isOpen={unitModal.isOpen}
        onClose={unitModal.close}
        onSave={unitModal.saveAndClose}
        {...unitModalConfig}
      />
    </>
  );
}
