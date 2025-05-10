// Baseノード実装 - 回転から直動への変換コンバーターの基本ノード
import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import baseRotToLinConverterNodeDefinition from './BaseRotToLinConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { RotToLinConverterNodeData } from '@/renderer/types/driveTypes';

interface BaseRotToLinConverterNodeProps
  extends NodeProps<RotToLinConverterNodeData> {
  readonly?: boolean;
  displayName?: string; // 表示名をpropsで受け取れるように追加
}

function BaseRotToLinConverterNode({
  id,
  data,
  readonly = false,
  displayName,
}: BaseRotToLinConverterNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: baseRotToLinConverterNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={{
        ...data,
        displayName: displayName || data.displayName, // 表示名を優先的に使用
      }}
      definition={baseRotToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(BaseRotToLinConverterNode);
