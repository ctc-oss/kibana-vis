import React from 'react';
import { render } from 'react-dom';
import { ExpressionRenderDefinition } from '../../../../src/plugins/expressions/common/expression_renderers';
import { DataPublicPluginSetup } from '../../../../src/plugins/data/public';
import { CoreSetup } from '../../../../src/core/public';
import { VisualizationContainer } from '../../../../src/plugins/visualizations/public';

import { KibanaData } from '@kibana-enhanced-vis/data-builder';
import { RadarParams } from '../defines/radar';
import VisualizerComponent from './Visualizer';

export interface RadarRenderValue {
  visData: KibanaData;
  visParams: RadarParams;
}

export interface RadarDeps {
  core: CoreSetup;
  plugins: {
    data: DataPublicPluginSetup;
  };
}

const RadarRenderer: () => ExpressionRenderDefinition<RadarRenderValue> = () => ({
  name: 'radar',
  displayName: 'Radar Visualization',
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

export default RadarRenderer;
