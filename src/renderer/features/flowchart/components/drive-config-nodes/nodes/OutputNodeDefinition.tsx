import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { createAllOutputFields } from '../fields/OutputSpecFields';

const outputNodeDefinition: NodeDefinition = {
  type: 'outputNode',
  title: 'Output',
  handles: { target: true, source: false },
  groupTitles: {
    output: 'Output',
  },
  groupDisplayOptions: {
    output: { showTitle: true, showDivider: false },
  },
  // 前段ノードから伝播するフィールド
  propagateFields: { outputSpec: 'prevOutputSpec' },

  // 初期データ生成
  getInitialData: () => ({
    dummy: '',
  }),

  /**
   * fields: 入力値なし。前段ノードの出力値（outputSpec）をreadonlyで表示するのみ。
   * 設計ドキュメント「出力ノード」仕様に準拠
   */
  fields: createAllOutputFields(),
  compute: (data: any, nodeId: string, update: (newData: any) => void) => {
    // prevOutputSpecが存在する場合、そのままoutputSpecにコピー
    if (
      data.prevOutputSpec &&
      JSON.stringify(data.outputSpec) !== JSON.stringify(data.prevOutputSpec)
    ) {
      update({
        ...data,
        outputSpec: data.prevOutputSpec,
      });
    }
  },
};

export default outputNodeDefinition;
