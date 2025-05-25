// Baseノード実装 - 回転から回転への変換コンバーターの基本ノード
import React, { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import baseRotToRotConverterNodeDefinition from './BaseRotToRotConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { RotToRotConverterNodeData } from '@/renderer/types/driveTypes';

interface BaseRotToRotConverterNodeProps {
  id: string;
  data: RotToRotConverterNodeData;
  readonly?: boolean;
  displayName?: string; // 表示名をpropsで受け取れるように追加
}

function BaseRotToRotConverterNode({
  id,
  data,
  readonly = false,
  displayName,
}: BaseRotToRotConverterNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: baseRotToRotConverterNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={{
        ...data,
        displayName: displayName || (data as any).displayName, // 表示名を優先的に使用
      }}
      definition={baseRotToRotConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

BaseRotToRotConverterNode.defaultProps = {
  readonly: false,
  displayName: undefined,
};

export default memo(BaseRotToRotConverterNode);
