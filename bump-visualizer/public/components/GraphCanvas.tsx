import React, { useEffect, useMemo, useState } from 'react';
import { EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ResponsiveBump } from '@nivo/bump';
import { merge } from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import { buildLegendModel, LegendRecord } from '@kibana-enhanced-vis/legend';
import { KibanaData, Graph } from '@kibana-enhanced-vis/data-builder';

import { buildBumpData, COLOR_PALETTES, BumpParams, queryMap } from '../defines/bump';

interface GraphAreaProps {
  showValues: boolean;
  regStroke: string;
  isRendered: boolean;
  animate: boolean;
  pointRadius: string;
}

export const GraphArea = styled.div<GraphAreaProps>`
  width: 860px;
  height: 540px;

  text {
    font-weight: 550;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
      sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important;
  }
`;

export const GraphGroup = styled.div`
  margin: 0 auto;
  overflow: hidden;
  overflow-x: hidden;
  background-color: #fff;

  &:focus {
    outline: 0 none !important;
  }

  &:focus-visible {
    outline: 0 none !important;
  }
`;

const WaitingForData = (
  <div style={{ marginTop: 20, textAlign: 'center' }}>
    <EuiEmptyPrompt
      title={<h2>No data found</h2>}
      body="Please change your data configuration, select another date/time range, or try a different query."
    />
  </div>
);

const GraphCanvas = ({ visData, visParams }: { visData: KibanaData; visParams: BumpParams }) => {
  const [currentParams, setCurrentParams] = useState<BumpParams>({
    colorScheme: '10color',
    curveType: 'linear',
    lineWidth: 3,
    pointBorderWidth: 3,
    pointSize: 10,
  });
  const [graph, setGraph] = useState<Graph>({} as Graph);
  const [legend, setLegend] = useState<LegendRecord>({});
  const [fullyRendered, setFullyRendered] = useState(false);

  useEffect(() => {
    if (visParams) setCurrentParams(merge(currentParams, visParams));
  }, [currentParams, visParams]);

  useEffect(() => {
    queryMap.clear();
    setFullyRendered(false);
    const canvas = document.querySelector('.visualization') as HTMLElement;
    canvas!.style.overflowX = 'hidden';

    // Reset SVG trickery (line drawing effect) so that lines do not re-render as dashed
    setTimeout(() => {
      const paths = document.querySelectorAll('#graphObject path:not(#regressionLine)');
      paths.forEach((p) => {
        p.setAttribute('pathLength', '1');
        p.setAttribute('stroke-dasharray', '1');
      });
    }, 10);

    setTimeout(() => {
      setFullyRendered(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (visData.aggs) {
      setGraph(buildBumpData(visData));
    }
  }, [visData]);

  useEffect(() => {
    const currentColorScheme = COLOR_PALETTES.find((cs) => cs.value === currentParams.colorScheme);

    if (currentColorScheme !== undefined && Object.keys(graph).length > 0) {
      setLegend(buildLegendModel(graph.keys, currentColorScheme.palette));
    }
  }, [visData.aggs, visParams, currentParams.colorScheme, graph]);

  const chart = useMemo(
    () => (
      <GraphArea
        id="graphObject"
        showValues={currentParams.showValues}
        regStroke={currentParams.regLineColor}
        isRendered={fullyRendered}
        animate={currentParams.animate}
        pointRadius={(currentParams.pointSize / 2).toString()}
      >
        <ResponsiveBump
          data={graph.data}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          colors={({ id }: { id: string }) => legend[id]?.color || 'rgba(0,0,0,0)'}
          axisTop={null}
          axisRight={null}
          interpolation={currentParams.curveType}
          activeLineWidth={6}
          inactiveLineWidth={3}
          inactiveOpacity={0.15}
          pointSize={currentParams.pointSize}
          activePointSize={16}
          inactivePointSize={0}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={currentParams.pointBorderWidth}
          activePointBorderWidth={3}
          pointBorderColor={{ from: 'serie.color' }}
          xPadding={0}
          lineWidth={currentParams.lineWidth}
          axisBottom={{
            tickRotation: -60,
            tickPadding: 5,
            format: (x) => moment(x).format('YYYY-MM-DD'),
          }}
          margin={{ top: 10, right: 120, bottom: 80, left: 10 }}
        />
      </GraphArea>
    ),
    [graph, currentParams, legend, visData]
  );

  const dataPopulated =
    (graph.data && graph.data.length > 0 && graph.keys && graph.keys.length > 0) ||
    Object.keys(legend).length > 0;

  return (
    <GraphGroup tabIndex={-1}>
      {dataPopulated ? (
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>{chart}</EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        WaitingForData
      )}
    </GraphGroup>
  );
};

export default GraphCanvas;
