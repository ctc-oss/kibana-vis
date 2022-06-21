import React from 'react';
import { render } from 'react-dom';
import { ExpressionRenderDefinition } from '../../../../src/plugins/expressions/common/expression_renderers';
import { DataPublicPluginSetup } from '../../../../src/plugins/data/public';
import { CoreSetup } from '../../../../src/core/public';
import { VisualizationContainer } from '../../../../src/plugins/visualizations/public';

import { KibanaData } from '@kibana-enhanced-vis/data-builder';
import { BumpParams } from '../defines/bump';
import VisualizerComponent from './Visualizer';

export interface BumpRenderValue {
  visData: KibanaData;
  visParams: BumpParams;
}

export interface BumpDeps {
  core: CoreSetup;
  plugins: {
    data: DataPublicPluginSetup;
  };
}

const BumpRenderer: () => ExpressionRenderDefinition<BumpRenderValue> = () => ({
  name: 'bump',
  displayName: 'Bump Visualization',
  reuseDomNode: true,
  render: async (domNode, { visData, visParams }, handlers) => {
    render(
      <VisualizationContainer handlers={handlers}>
        <VisualizerComponent visData={visData} visParams={visParams} />
      </VisualizationContainer>,
      domNode
    );
  },
});

export default BumpRenderer;
