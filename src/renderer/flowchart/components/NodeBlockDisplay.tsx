import React from 'react';
import { NodeBlock } from '../types/nodeBlocks';
import { useReactFlow } from '@xyflow/react';
import { useDnD } from '../utils/DnDContext';

interface NodeBlockDisplayProps {
  blocks: NodeBlock[];
}

/**
 * ノードブロックを表示する共通コンポーネント
 * 各ブロックのタイトルとそのブロックに含まれるノードを表示します
 */
export default function NodeBlockDisplay({ blocks }: NodeBlockDisplayProps) {
  const [, setType] = useDnD();
  const { addNodes } = useReactFlow();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';

    // DnDContextにノードタイプを設定
    setType(nodeType);
  };

  return (
    <div>
      {blocks.map((block, blockIndex) => (
        <div key={`block-${blockIndex}`}>
          <h4>{block.title}</h4>
          <div className="dndnodes">
            {block.nodes.map((node, nodeIndex) => (
              <div
                key={`node-${nodeIndex}`}
                className="dndnode"
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                {node.label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
