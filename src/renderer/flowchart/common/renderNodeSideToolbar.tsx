import React from 'react';
import { NodeToolbar, Position, useReactFlow } from '@xyflow/react';

/**
 * ノード追加用のボタンをNodeToolbarにまとめて表示し、クリック時にノード追加＆エッジ接続する共通コンポーネント
 * @param options - { label: string, nodeType: string }[] ボタン表示ラベルとノードタイプのペア
 * @param currentNodeId - 現在のノードID
 */
function RenderNodeSideToolbar({
  options,
  currentNodeId,
}: {
  options: { label: string; nodeType: string }[];
  currentNodeId: string;
}) {
  const { addNodes, addEdges, getNode, setNodes } = useReactFlow();

  // ノードのhidden状態を取得する関数
  const isNodeVisible = (nodeType: string) => {
    const detailNodeId = `${nodeType}-${currentNodeId}`;
    const node = getNode(detailNodeId);
    return node && !node.hidden;
  };

  // ノードの表示/非表示切替
  const handleDetailNodeButtonClick = (nodeType: string) => {
    const currentNode = getNode(currentNodeId);
    if (!currentNode) return;
    const detailNodeId = `${nodeType}-${currentNodeId}`;
    const existingNode = getNode(detailNodeId);
    if (existingNode) {
      const isHidden = !!existingNode?.hidden;
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
          x: currentNode.position.x + 500,
          y: currentNode.position.y,
        },
        data: { sourceNodeId: currentNodeId },
      };
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
      {options.map(({ label, nodeType }) => {
        const active = isNodeVisible(nodeType);
        return (
          <button
            key={nodeType}
            type="button"
            className={
              active
                ? 'node-toolbar__button node-toolbar__button--active'
                : 'node-toolbar__button'
            }
            onClick={() => handleDetailNodeButtonClick(nodeType)}
          >
            {label}
          </button>
        );
      })}
    </NodeToolbar>
  );
}

export default RenderNodeSideToolbar;
