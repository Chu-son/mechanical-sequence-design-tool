import { useEffect } from 'react';

interface NodeDefinition {
  getInitialData?: () => any;
  // 必要に応じて他のプロパティも追加可能
}

interface UseNodeInitialDataProps {
  id: string;
  data?: any;
  definition: NodeDefinition;
  updateNodeData: (id: string, data: any) => void;
}

export function useNodeInitialData({
  id,
  data,
  definition,
  updateNodeData,
}: UseNodeInitialDataProps) {
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      const initialData = definition.getInitialData?.() || {};
      updateNodeData(id, initialData);
    }
  }, [id, data, definition, updateNodeData]);
}
