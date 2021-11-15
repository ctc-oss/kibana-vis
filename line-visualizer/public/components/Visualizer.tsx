import React from 'react';

import GraphCanvas from './GraphCanvas';
import { KibanaData } from '@kibana-enhanced-vis/data-builder';
import { LineParams } from '../defines/line';

const VisualizerComponent = ({
  visData,
  visParams,
}: {
  visData: KibanaData;
  visParams: LineParams;
}) => {
  return <GraphCanvas visData={visData} visParams={visParams} />;
};

export default VisualizerComponent;
