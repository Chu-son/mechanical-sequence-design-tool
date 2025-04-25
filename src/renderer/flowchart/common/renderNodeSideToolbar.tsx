import React from 'react';
import { NodeToolbar, Position } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

/**
 * ノード追加用のボタンをNodeToolbarにまとめて表示し、クリック時にノード追加＆エッジ接続する共通関数
 * @param options - { label: string, nodeType: string }[] ボタン表示ラベルとノードタイプのペア
 * @param currentNodeId - 現在のノードID
 * @param reactFlowApi - { addNodes, addEdges, getNode }
 * @param getNodeData - ノード追加時にdataを生成する関数 (nodeType, currentNodeId, currentNode) => data
 * @param toolbarProps - NodeToolbarの追加props（任意）
 */
export function renderNodeSideToolbar(
  options: { label: string; nodeType: string }[],
  currentNodeId: string,
  getNodeData?: (
    nodeType: string,
    currentNodeId: string,
    currentNode: any,
  ) => any,
) {
  const { addNodes, addEdges, getNode, setNodes } = useReactFlow();

  // VelocityFigureNodeの表示/非表示切替用
  const handleDetailNodeButtonClick = (nodeType: string) => {
    // 既に同じノードが存在するかチェック
    const currentNode = getNode(currentNodeId);
    if (!currentNode) return;

    const detailNodeId = `${nodeType}-${currentNodeId}`;
    const existingNode = getNode(detailNodeId);
    if (existingNode) {
      // 表示/非表示を切り替える（hiddenフラグをdataに持たせる）
      const isHidden = !!existingNode?.hidden;
      console.log(`[${nodeType}] ノード表示/非表示切替 - ID: ${detailNodeId}`);
      if (setNodes) {
        setNodes((nodes: any[]) =>
          nodes.map((n) =>
            n.id === detailNodeId
              ? {
                  ...n,
                  hidden: !isHidden,
                }
              : n,
          ),
        );
      }
    } else {
      // ノードがなければ追加
      const newNode = {
        id: detailNodeId,
        type: nodeType,
        position: {
          x: currentNode.position.x + 300,
          y: currentNode.position.y,
        },
        data: getNodeData
          ? getNodeData(nodeType, currentNodeId, currentNode)
          : { sourceNodeId: currentNodeId },
      };
      newNode.data = { ...newNode.data }; // 初期状態は表示
      addNodes([newNode]);
      addEdges([
        {
          id: `edge-${currentNodeId}-${detailNodeId}`,
          source: currentNodeId,
          sourceHandle: 'right',
          target: detailNodeId,
          targetHandle: 'target',
        },
      ]);
    }
  };

  return (
    <NodeToolbar
      position={Position.Right}
      align="start"
      isVisible
      className="node-toolbar"
    >
      {options.map(({ label, nodeType }) => (
        <button
          key={nodeType}
          type="button"
          onClick={() => {
            handleDetailNodeButtonClick(nodeType);
          }}
        >
          {label}
        </button>
      ))}
    </NodeToolbar>
  );
}
