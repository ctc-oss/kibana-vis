import React from 'react';

import GraphCanvas from './GraphCanvas';
import { KibanaData } from '@kibana-enhanced-vis/data-builder';
import { BumpParams } from '../defines/bump';

const VisualizerComponent = ({
  visData,
  visParams,
}: {
  visData: KibanaData;
  visParams: BumpParams;
}) => {
  return <GraphCanvas visData={visData} visParams={visParams} />;
};

export default VisualizerComponent;
