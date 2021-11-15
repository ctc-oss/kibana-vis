import React from 'react';
import { render } from 'react-dom';
import { ExpressionRenderDefinition } from '../../../../src/plugins/expressions/common/expression_renderers';
import { DataPublicPluginSetup } from '../../../../src/plugins/data/public';
import { CoreSetup } from '../../../../src/core/public';
import { VisualizationContainer } from '../../../../src/plugins/visualizations/public';

import { KibanaData } from '@kibana-enhanced-vis/data-builder';
import { LineParams } from '../defines/line';
import VisualizerComponent from './Visualizer';

export interface LineRenderValue {
  visData: KibanaData;
  visParams: LineParams;
}

export interface LineDeps {
  core: CoreSetup;
  plugins: {
    data: DataPublicPluginSetup;
  };
}

const LineRenderer: () => ExpressionRenderDefinition<LineRenderValue> = () => ({
  name: 'line',
  displayName: 'Line Visualization',
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

export default LineRenderer;
