// Baseノード実装 - 回転から直動への変換コンバーターの基本ノード
import React, { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import baseRotToLinConverterNodeDefinition from './BaseRotToLinConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { RotToLinConverterNodeData } from '@/renderer/types/driveTypes';

interface BaseRotToLinConverterNodeProps {
  id: string;
  data: RotToLinConverterNodeData;
  readonly?: boolean;
  displayName?: string;
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
        displayName: displayName || (data as any).displayName,
      }}
      definition={baseRotToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

BaseRotToLinConverterNode.defaultProps = {
  readonly: false,
  displayName: undefined,
};

export default memo(BaseRotToLinConverterNode);
