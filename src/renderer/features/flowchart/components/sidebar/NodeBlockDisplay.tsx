import { NodeBlock } from '@/renderer/features/flowchart/types/nodeBlocks';
import { useDnD } from '@/renderer/features/flowchart/utils/DnDContext';

interface NodeBlockDisplayProps {
  blocks: NodeBlock[];
}

/**
 * ノードブロックを表示する共通コンポーネント
 * 各ブロックのタイトルとそのブロックに含まれるノードを表示します
 */
export default function NodeBlockDisplay({ blocks }: NodeBlockDisplayProps) {
  const [, setType] = useDnD();

  // ノード情報を全てdataTransferに渡す
  const onDragStart = (event: React.DragEvent, node: any) => {
    // baseNodeTypeをreactflowのタイプとして設定
    // これによりindex.tsで登録したnodeTypesの正しいコンポーネントが選択される
    event.dataTransfer.setData('application/reactflow', node.baseNodeType);

    // ノードの追加情報をJSONとして渡す
    event.dataTransfer.setData('application/nodeinfo', JSON.stringify(node));

    event.dataTransfer.effectAllowed = 'move';
    setType(node.baseNodeType);
  };

  return (
    <div>
      {blocks.map((block, blockIndex) => (
        <div key={`block-${blockIndex}`} className="node-block">
          <h4>{block.title}</h4>
          <div className="dndnodes">
            {block.nodes.map((node, nodeIndex) => (
              <div
                key={`node-${nodeIndex}`}
                className={`dndnode ${node.isPart ? 'part-node' : ''}`}
                onDragStart={(event) => onDragStart(event, node)}
                draggable
                title={node.isPart ? `部品ID: ${node.partId}` : ''}
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
