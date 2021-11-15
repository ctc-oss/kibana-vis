import React from 'react';

import GraphCanvas from './GraphCanvas';
import { KibanaData } from '@kibana-enhanced-vis/data-builder';
import { RadarParams } from '../defines/radar';

const VisualizerComponent = ({
  visData,
  visParams,
}: {
  visData: KibanaData;
  visParams: RadarParams;
}) => {
  return <GraphCanvas visData={visData} visParams={visParams} />;
};

export default VisualizerComponent;
